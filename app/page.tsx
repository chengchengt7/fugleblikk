import SearchField from "@/components/SearchField/SearchField";
import saved from "@/data/observed-birds.json";
import { prepareBirdMap } from "@/lib/bird-map";
import { searchBirds } from "@/lib/search-birds";
import type { ObservationSnapshot } from "@/types/bird";

const snapshot: ObservationSnapshot = saved;
const mapSlots = prepareBirdMap(snapshot.birds);

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const results = query.trim() ? await searchBirds(query.trim(), snapshot.birds) : null;
  return (
    <main>
      <SearchField
        key={snapshot.preparedAt}
        slots={mapSlots}
        recordings={snapshot.birds.flatMap((bird) =>
          bird.media?.sound ? [bird.media.sound.fileUrl] : [],
        )}
        initialQuery={query}
        initialResult={results}
      />
    </main>
  );
}
