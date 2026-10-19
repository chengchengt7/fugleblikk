export type ObservedBird = {
  id: number;
  norwegianName: string | null;
  scientificName: string;
  observedDate: string;
  longitude: number;
  latitude: number;
  observationId: string;
  sourceUrl: string | null;
};

export type ObservationSnapshot = {
  period: { from: string; to: string };
  preparedAt: string;
  totalSpecies: number;
  birds: ObservedBird[];
};
