import {
  ARTSDATABANKEN_NAME_SEARCH_API_ENDPOINT,
  INATURALIST_TAXON_AUTOCOMPLETE_API_ENDPOINT,
} from "@/constants/api";
import type { ObservedBird } from "@/types/bird";

type Taxon = {
  id: number;
  name: string;
  rank: string;
  iconic_taxon_name: string;
  preferred_common_name?: string;
};
type NorwegianHit = { title: string; url: string };

async function request<T>(url: URL): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Search failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export type BirdSearchResult =
  | { status: "error" | "empty" | "outside" }
  | { status: "found"; birdId: number };

export async function searchBirds(query: string, birds: ObservedBird[]): Promise<BirdSearchResult> {
  try {
    const searchName = query.trim().toLocaleLowerCase("nb-NO");
    const englishUrl = new URL(INATURALIST_TAXON_AUTOCOMPLETE_API_ENDPOINT);
    englishUrl.search = new URLSearchParams({ q: query, locale: "en", per_page: "100" }).toString();
    const norwegianUrl = new URL(ARTSDATABANKEN_NAME_SEARCH_API_ENDPOINT);
    norwegianUrl.search = new URLSearchParams({ q: query }).toString();

    const [english, norwegian] = await Promise.allSettled([
      request<{ results: Taxon[] }>(englishUrl),
      request<{ result: NorwegianHit[] }>(norwegianUrl),
    ]);
    const taxa = (english.status === "fulfilled" ? english.value.results : []).filter((taxon) =>
      taxon.rank === "species" &&
      taxon.iconic_taxon_name === "Aves" &&
      taxon.preferred_common_name?.toLocaleLowerCase("nb-NO") === searchName,
    );
    const norwegianFound = (
      norwegian.status === "fulfilled" ? norwegian.value.result : []
    ).some(
      (hit) => hit.url.split("/").includes("Aves") &&
        hit.title.toLocaleLowerCase("nb-NO") === searchName,
    );
    if (!taxa.length && !norwegianFound) {
      return { status: english.status === "rejected" || norwegian.status === "rejected" ? "error" : "empty" };
    }

    const ids = new Set(taxa.map((taxon) => taxon.id));
    const names = new Set(taxa.map((taxon) => taxon.name.toLowerCase()));
    const match = birds.find((bird) =>
      (norwegianFound && bird.norwegianName.toLocaleLowerCase("nb-NO") === searchName) ||
      (bird.media?.inaturalistTaxonId != null && ids.has(bird.media.inaturalistTaxonId)) ||
      names.has(bird.scientificName.toLowerCase()),
    );
    if (!match) return { status: "outside" };
    return { status: "found", birdId: match.id };
  } catch {
    return { status: "error" };
  }
}
