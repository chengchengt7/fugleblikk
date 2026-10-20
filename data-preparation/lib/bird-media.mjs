import { readFile } from "node:fs/promises";
import {
  INATURALIST_TAXA_API_ENDPOINT,
  INATURALIST_TAXON_AUTOCOMPLETE_API_ENDPOINT,
  WIKIPEDIA_PAGE_SUMMARY_API_ENDPOINT,
  XENO_CANTO_RECORDINGS_API_ENDPOINT,
} from "../../constants/api.ts";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let nextInatRequest = 0;
let nextXenoRequest = 0;

async function requestJson(url, source) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const next = source === "iNaturalist" ? nextInatRequest : nextXenoRequest;
    await wait(Math.max(0, next - Date.now()));
    if (source === "iNaturalist") nextInatRequest = Date.now() + 1100;
    else nextXenoRequest = Date.now() + 1100;
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Fugleblikk/0.1 (bird data preparation)" },
        signal: AbortSignal.timeout(30000),
      });
      if (response.ok) return response.json();
      if (response.status < 500 && response.status !== 429)
        throw new Error(`${source} HTTP ${response.status}`);
    } catch (error) {
      if (attempt === 3)
        throw new Error(`${source} request failed: ${error.message}`);
    }
    await wait((attempt + 1) * 3000);
  }
  throw new Error(`${source} request failed`);
}

function plainText(html) {
  const entities = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
    nbsp: " ",
  };
  return (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
      if (entity.startsWith("#x"))
        return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
      if (entity.startsWith("#"))
        return String.fromCodePoint(Number(entity.slice(1)));
      return entities[entity.toLowerCase()] || match;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function photoData(photo, size) {
  if (!photo?.id || !photo?.license_code) return null;
  const base =
    photo[`${size}_url`] || photo.url?.replace(/\/square\./, `/${size}.`);
  if (!base) return null;
  return {
    url: base,
    sourceUrl: `https://www.inaturalist.org/photos/${photo.id}`,
    attribution: photo.attribution || photo.attribution_name || "iNaturalist",
    license: photo.license_code,
  };
}

const xenoNames = {
  "Thinornis dubius": "Charadrius dubius",
  "Botaurus minutus": "Ixobrychus minutus",
  "Eudromias morinellus": "Charadrius morinellus",
  "Cecropis rufula": "Cecropis daurica rufula",
  "Anarhynchus alexandrinus": "Charadrius alexandrinus",
  "Astur gentilis": "Accipiter gentilis",
  "Ardea ibis": "Bubulcus ibis",
  "Anarhynchus atrifrons": "Charadrius mongolus atrifrons",
};

function recordingSeconds(length) {
  const parts = (length || "").split(":").map(Number);
  return parts.length === 2 && parts.every(Number.isFinite)
    ? parts[0] * 60 + parts[1]
    : Infinity;
}

async function findRecording(name, key) {
  const [genus, species, subspecies] = (xenoNames[name] || name).split(/\s+/);
  const url = new URL(XENO_CANTO_RECORDINGS_API_ENDPOINT);
  url.search = new URLSearchParams({
    query: `gen:${genus} sp:${species}${subspecies ? ` ssp:${subspecies}` : ""}`,
    key,
  }).toString();
  const data = await requestJson(url, "Xeno-canto");
  const candidates = (data.recordings || []).filter(
    (item) =>
      item.gen?.toLowerCase() === genus.toLowerCase() &&
      item.sp?.toLowerCase() === species.toLowerCase() &&
      (!subspecies || item.ssp?.toLowerCase() === subspecies.toLowerCase()) &&
      item.file &&
      item.lic,
  );
  const recording =
    candidates.find(
      (item) =>
        /\.mp3$/i.test(item["file-name"] || "") &&
        recordingSeconds(item.length) <= 90,
    ) || candidates[0];
  if (!recording) return null;
  return {
    id: recording.id,
    fileUrl: recording.file,
    sourceUrl: recording.url || `https://xeno-canto.org/${recording.id}`,
    recordist: recording.rec || "Xeno-canto",
    license: recording.lic,
    type: recording.type || "Recording",
    length: recording.length || null,
  };
}

async function findTaxonId(name) {
  const url = new URL(INATURALIST_TAXON_AUTOCOMPLETE_API_ENDPOINT);
  url.search = new URLSearchParams({
    q: name,
    per_page: "30",
    locale: "en",
  }).toString();
  const data = await requestJson(url, "iNaturalist");
  return (
    data.results?.find(
      (taxon) => taxon.name?.toLowerCase() === name.toLowerCase(),
    )?.id || null
  );
}

async function wikipediaDescription(name) {
  const title = encodeURIComponent(name.replaceAll(" ", "_"));
  try {
    const data = await requestJson(
      `${WIKIPEDIA_PAGE_SUMMARY_API_ENDPOINT}/${title}`,
      "Wikipedia",
    );
    if (!data.extract || data.type === "disambiguation") return null;
    return {
      text: data.extract,
      sourceName: "Wikipedia",
      sourceUrl:
        data.content_urls?.desktop?.page ||
        `https://en.wikipedia.org/wiki/${title}`,
    };
  } catch {
    return null;
  }
}

function mediaFromTaxon(taxon, sound) {
  const photos = [
    taxon?.default_photo,
    ...(taxon?.taxon_photos || []).map((item) => item.photo),
  ];
  const seen = new Set();
  const detailPhotos = photos
    .filter((photo) => {
      if (!photo?.id || seen.has(photo.id)) return false;
      seen.add(photo.id);
      return true;
    })
    .map((photo) => photoData(photo, "large"))
    .filter(Boolean)
    .slice(0, 4);
  const cardPhoto =
    photoData(taxon?.default_photo, "medium") ||
    (detailPhotos[0] && {
      ...detailPhotos[0],
      url: detailPhotos[0].url.replace(/\/large\./, "/medium."),
    });
  const summary = plainText(taxon?.wikipedia_summary);
  return {
    inaturalistTaxonId: taxon?.id || null,
    englishName: taxon?.preferred_common_name || null,
    cardPhoto,
    detailPhotos,
    description: summary
      ? {
          text: summary,
          sourceName: taxon.wikipedia_url ? "Wikipedia" : "iNaturalist",
          sourceUrl:
            taxon.wikipedia_url ||
            `https://www.inaturalist.org/taxa/${taxon.id}`,
        }
      : null,
    sound,
  };
}

export async function enrichBirds(birds, previousBirds = []) {
  for (const bird of birds) {
    bird.scientificName = bird.scientificName.trim();
    if (bird.media?.description && !bird.media.description.sourceUrl) {
      bird.media.description.sourceName = "iNaturalist";
      bird.media.description.sourceUrl = `https://www.inaturalist.org/taxa/${bird.media.inaturalistTaxonId}`;
    }
    if (!bird.media?.cardPhoto && bird.media?.detailPhotos?.[0]) {
      bird.media.cardPhoto = {
        ...bird.media.detailPhotos[0],
        url: bird.media.detailPhotos[0].url.replace(/\/large\./, "/medium."),
      };
    }
  }
  if (!process.env.XENO_CANTO_API_KEY) {
    try {
      process.loadEnvFile(".env.local");
    } catch {
      /* CI uses its secret. */
    }
  }
  const key = process.env.XENO_CANTO_API_KEY;
  const previous = new Map(previousBirds.map((bird) => [bird.id, bird]));
  const soundless = [];
  const missing = birds.filter((bird) => {
    const old = previous.get(bird.id);
    if (
      old?.scientificName.trim() === bird.scientificName.trim() &&
      old.media
    ) {
      bird.media = old.media;
      if (!bird.media.sound) soundless.push(bird);
      return false;
    }
    return true;
  });
  if (
    !missing.length &&
    !soundless.length &&
    birds.every((bird) => bird.media?.description)
  )
    return birds;
  if (!key && (missing.length || soundless.length))
    throw new Error("XENO_CANTO_API_KEY is required to prepare bird media");

  let seed = new Map();
  if (process.env.INAT_AUDIT_PATH) {
    const rows = JSON.parse(
      await readFile(process.env.INAT_AUDIT_PATH, "utf8"),
    );
    seed = new Map(
      rows.filter((row) => row.inat_id).map((row) => [row.name, row.inat_id]),
    );
  }
  const ids = new Map();
  for (const bird of missing) {
    const name = bird.scientificName.trim();
    ids.set(bird.id, seed.get(name) || (await findTaxonId(name)));
  }
  const taxons = new Map();
  const allIds = [...new Set([...ids.values()].filter(Boolean))];
  for (let i = 0; i < allIds.length; i += 25) {
    const batch = allIds.slice(i, i + 25);
    const data = await requestJson(
      `${INATURALIST_TAXA_API_ENDPOINT}/${batch.join(",")}?locale=en`,
      "iNaturalist",
    );
    for (const taxon of data.results || []) taxons.set(taxon.id, taxon);
    console.log(
      `iNaturalist details ${Math.min(i + 25, allIds.length)}/${allIds.length}`,
    );
  }
  for (const [index, bird] of missing.entries()) {
    const name = bird.scientificName.trim();
    bird.media = mediaFromTaxon(
      taxons.get(ids.get(bird.id)),
      await findRecording(name, key),
    );
    if ((index + 1) % 50 === 0)
      console.log(`Bird media ${index + 1}/${missing.length}`);
  }
  for (const bird of soundless) {
    bird.media.sound = await findRecording(bird.scientificName, key);
  }
  for (const bird of birds) {
    if (!bird.media?.description) {
      bird.media.description = await wikipediaDescription(bird.scientificName);
    }
  }
  return birds;
}
