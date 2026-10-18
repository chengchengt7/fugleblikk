import saved from "@/data/observed-birds.json";

export type ObservedBird = {
  id: number;
  norwegianName: string | null;
  scientificName: string;
  observedDate: string;
  longitude: number;
  latitude: number;
  precisionMeters: number | null;
  observationId: string;
  sourceUrl: string | null;
  region: string;
};

export type ObservationSnapshot = {
  period: { from: string; to: string };
  preparedAt: string;
  totalSpecies: number;
  birds: ObservedBird[];
};

// The preparation job does the API work; visitors only read this small saved file.
export function getObservedBirds(): ObservationSnapshot {
  return saved;
}
