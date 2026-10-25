// Approximate monthly positions for one representative population of each species.
// These illustrate seasonal movement; they are not individual tracking records.
export const migrationRoutes: {
  id: number;
  name: string;
  color: string;
  source: string;
  positions: [number, number][]; // [longitude, latitude], January through December
}[] = [
  {
    id: 3771,
    name: "Arctic Tern",
    color: "#e0ffa1",
    source:
      "https://www.bas.ac.uk/data/our-data/publication/tracking-of-arctic-terns-sterna-paradisaea-reveals-longest-animal-migration/",
    positions: [
      [-5, -62],
      [-8, -62],
      [-18, -40],
      [-28, 0],
      [-20, 48],
      [18, 69],
      [18, 69],
      [0, 53],
      [-17, 25],
      [-18, -20],
      [-8, -52],
      [-5, -62],
    ],
  },
  {
    id: 203661,
    name: "Barn Swallow",
    color: "#7dd3fc",
    source: "https://www.bto.org/learn/about-birds/birdfacts/swallow",
    positions: [
      [28, -28],
      [25, -25],
      [10, 5],
      [8, 43],
      [12, 60],
      [12, 60],
      [12, 60],
      [10, 57],
      [5, 42],
      [-5, 22],
      [15, -10],
      [28, -28],
    ],
  },
  {
    id: 3438,
    name: "Pink-footed Goose",
    color: "#ff9b82",
    source: "https://npolar.no/en/species/pink-footed-goose/",
    positions: [
      [5, 53],
      [5, 53],
      [9, 56],
      [11, 64],
      [15, 78],
      [15, 78],
      [15, 78],
      [15, 78],
      [16, 69],
      [9, 56],
      [5, 53],
      [5, 53],
    ],
  },
  {
    id: 3722,
    name: "Red-necked Phalarope",
    color: "#d8b4fe",
    source:
      "https://www.frontiersin.org/journals/ecology-and-evolution/articles/10.3389/fevo.2019.00086/full",
    positions: [
      [61, 16],
      [61, 16],
      [55, 20],
      [38, 42],
      [24, 58],
      [20, 69],
      [20, 69],
      [25, 59],
      [36, 43],
      [57, 20],
      [61, 16],
      [61, 16],
    ],
  },
  {
    id: 203588,
    name: "Osprey",
    color: "#facc5f",
    source: "https://doi.org/10.51812/of.133952",
    positions: [
      [4.6, 9.8],
      [4.6, 9.8],
      [4.6, 9.8],
      [4.6, 9.8],
      [10, 35],
      [11, 64],
      [11, 64],
      [11, 64],
      [8, 39],
      [8, 39],
      [4.6, 9.8],
      [4.6, 9.8],
    ],
  },
];
