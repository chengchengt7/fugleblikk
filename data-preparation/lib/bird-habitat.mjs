import { ARTSDATABANKEN_SPECIES_PAGE_ENDPOINT } from "../../constants/api.ts";

function habitatsFromPage(html) {
  const section = html.match(
    /<section class="habitat">([\s\S]*?)<\/section>/,
  )?.[1];
  return section
    ? [...section.matchAll(/<summary>([^<]+)<\/summary>/g)].map((match) =>
        match[1].trim(),
      )
    : [];
}

async function fetchHabitats(id) {
  const response = await fetch(
    `${ARTSDATABANKEN_SPECIES_PAGE_ENDPOINT}/${id}`,
    {
      headers: { "User-Agent": "Fugleblikk/0.1 (bird data preparation)" },
      signal: AbortSignal.timeout(30000),
    },
  );
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`Artsdatabanken HTTP ${response.status}`);
  return habitatsFromPage(await response.text());
}

export async function enrichHabitats(birds, previousBirds = []) {
  const previous = new Map(previousBirds.map((bird) => [bird.id, bird]));
  for (const bird of birds) {
    if (Array.isArray(bird.habitats)) continue;
    const old = previous.get(bird.id);
    bird.habitats = Array.isArray(old?.habitats)
      ? old.habitats
      : await fetchHabitats(bird.id);
  }
}
