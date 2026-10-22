type BirdPhoto = {
  url: string;
  cutoutUrl?: string;
  sourceUrl: string;
  attribution: string;
  license: string;
};

export type ObservedBird = {
  id: number;
  norwegianName: string;
  scientificName: string;
  habitats: string[];
  observedDate: string;
  longitude: number;
  latitude: number;
  observationId: string;
  media?: {
    inaturalistTaxonId: number | null;
    englishName: string | null;
    cardPhoto: BirdPhoto | null;
    detailPhotos: BirdPhoto[];
    description: {
      text: string;
      sourceName: string;
      sourceUrl: string | null;
    } | null;
    sound: {
      fileUrl: string;
      sourceUrl: string;
      recordist: string;
      license: string;
      type: string;
      length: string | null;
    } | null;
  };
};

export type BirdCardBird = {
  id: number;
  norwegianName: string;
  scientificName: string;
  habitats: string[];
  media?: {
    englishName: string | null;
    cardPhoto: { url: string } | null;
    sound: { fileUrl: string } | null;
  };
};

export type ObservationSnapshot = {
  period: { from: string; to: string };
  preparedAt: string;
  mediaPreparedAt?: string;
  totalSpecies: number;
  birds: ObservedBird[];
};
