import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import {
  getCandidates,
  getPage,
  loadTaxonomy,
} from "./lib/observation-api.mjs";
import {
  createTaxonomy,
  getMonths,
  getPeriod,
  selectLatest,
} from "./lib/observation-rules.mjs";

const period = getPeriod();
const scope = JSON.parse(
  await readFile("data/norwegian-scope.geojson", "utf8"),
);
const resolve = createTaxonomy(await loadTaxonomy());
const candidates = new Map();
for (const id of await getCandidates(period)) {
  const bird = resolve(id);
  if (!bird) continue;
  if (!candidates.has(bird.id)) candidates.set(bird.id, new Set([bird.id]));
  candidates.get(bird.id).add(id);
}
if (!candidates.size)
  throw new Error("No candidate species returned; previous snapshot preserved");

const latest = new Map();
const stats = {
  inspectedDetails: 0,
  countOnlyRecords: 0,
  coordinates: 0,
  date: 0,
  unidentified: 0,
  outsideScope: 0,
};
// Each run has a private resumable cache. Never mix fresh pages with old runs.
const run = process.env.OBSERVATION_RUN_ID || `${period.from}_${period.to}`;
const cache = `.cache/observations/${run}`;
console.log(
  `Preparing ${period.from}–${period.to}; ${candidates.size} candidate species`,
);

// Start at the newest month. Once a bird has a usable location, older months
// cannot improve it, so subsequent requests only include the remaining species.
for (const [index, month] of getMonths(period).entries()) {
  const missing = [...candidates].filter(([id]) => !latest.has(id));
  if (!missing.length) break;
  const taxons =
    index === 0 ? [252] : [...new Set(missing.flatMap(([, ids]) => [...ids]))];
  // Small groups keep URLs short enough for the upstream API.
  for (let start = 0; start < taxons.length; start += 25) {
    const group = taxons.slice(start, start + 25);
    const first = await getPage(month, group, 0, cache);
    let received = 0;
    for (let page = 0; page < first.TotalPages; page++) {
      const data =
        page === 0 ? first : await getPage(month, group, page, cache);
      if (
        data.TotalCount !== first.TotalCount ||
        data.TotalPages !== first.TotalPages
      )
        throw new Error(
          "Source changed during pagination. Start a fresh run; previous snapshot preserved.",
        );
      received += data.Observations.length;
      for (const observation of data.Observations) {
        stats.inspectedDetails++;
        const reason = selectLatest(
          latest,
          observation,
          resolve(observation.TaxonId, observation.ScientificNameId),
          period,
          scope,
        );
        if (reason in stats) stats[reason]++;
      }
      console.log(
        `${month.from} · page ${page + 1}/${first.TotalPages} · ${latest.size} species with locations`,
      );
    }
    // Some indexed records have a count but no returned detail; do not invent a location.
    stats.countOnlyRecords += Math.max(0, first.TotalCount - received);
  }
}
const birds = [...latest.values()].sort((a, b) =>
  (a.norwegianName || a.scientificName).localeCompare(
    b.norwegianName || b.scientificName,
    "nb",
  ),
);
if (!birds.length)
  throw new Error("No usable observations; previous snapshot preserved");
const snapshot = {
  period,
  preparedAt: new Date().toISOString(),
  totalSpecies: birds.length,
  candidateSpecies: candidates.size,
  stats,
  birds,
};
await mkdir("data", { recursive: true });
// Replace the published snapshot only after a successful complete preparation.
await writeFile(
  "data/observed-birds.json.tmp",
  `${JSON.stringify(snapshot, null, 2)}\n`,
);
await rename("data/observed-birds.json.tmp", "data/observed-birds.json");
console.log(`Saved ${birds.length} species to data/observed-birds.json`);
