import { parse } from "csv-parse/sync";
import { BIRD_TAXONOMY_API_ENDPOINT } from "@/constants/api";

export type Bird = {
  id: number;
  norwegianName: string | null;
  scientificName: string;
};

type TaxonomyRow = {
  TaxonId: string;
  VernacularNameBokmaal: string;
  PresentationName: string;
  Rank: string;
  TaxonomicStatus: string;
  ExistsInNorway: string;
};

export async function getBirds(): Promise<Bird[]> {
  const response = await fetch(BIRD_TAXONOMY_API_ENDPOINT);

  if (!response.ok) {
    throw new Error(`Artsdatabanken returned ${response.status}`);
  }

  const csv = await response.text();
 
  const rows = parse(csv, {
    columns: true,
    delimiter: ";",
    bom: true,
    skip_empty_lines: true,
  }) as TaxonomyRow[];

  console.log(rows.slice(0, 5));

  const birds = new Map<number, Bird>();

  for (const row of rows) {
    if (
      row.Rank !== "Species" ||
      row.TaxonomicStatus !== "Accepted" ||
      row.ExistsInNorway !== "True"
    ) {
      continue;
    }

    const id = Number(row.TaxonId);
    if (!Number.isSafeInteger(id) || id <= 0 || !row.PresentationName) {
      continue;
    }

    birds.set(id, {
      id,
      norwegianName: row.VernacularNameBokmaal || null,
      scientificName: row.PresentationName,
    });
  }

  return [...birds.values()].sort((a, b) =>
    (a.norwegianName || a.scientificName).localeCompare(
      b.norwegianName || b.scientificName,
      "nb",
    ),
  );
}
