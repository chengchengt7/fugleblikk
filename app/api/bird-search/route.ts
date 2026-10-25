import saved from "@/data/observed-birds.json";
import { searchBirds } from "@/lib/search-birds";
import type { ObservationSnapshot } from "@/types/bird";

const snapshot: ObservationSnapshot = saved;

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();
  if (!query) return Response.json({ status: "empty" });
  return Response.json(await searchBirds(query, snapshot.birds));
}
