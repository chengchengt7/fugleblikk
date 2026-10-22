import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import type { MultiPolygon } from "geojson";
import land from "@/data/norway-land.json";
import type { BirdCardBird, ObservedBird } from "@/types/bird";

export type BirdMapSlot = {
  id: number;
  name: string;
  bird: BirdCardBird;
  cutoutUrl: string;
  longitude: number;
  latitude: number;
  side: number;
};

const longitudeScale = 0.45;
const mainland = {
  type: "MultiPolygon",
  coordinates: land.coordinates.filter(
    (polygon) =>
      Math.max(...polygon[0].map((point) => point[1])) < 74 &&
      Math.max(...polygon[0].map((point) => point[0])) > 0,
  ),
} as MultiPolygon;
const svalbard = {
  type: "MultiPolygon",
  coordinates: land.coordinates.filter(
    (polygon) => Math.min(...polygon[0].map((point) => point[1])) >= 74,
  ),
} as MultiPolygon;

type Cell = { longitude: number; latitude: number };

function cellsFor(side: number, region: "mainland" | "svalbard") {
  const cells: Cell[] = [];
  const north = region === "svalbard";
  const minLatitude = north ? 74 : 58;
  const maxLatitude = north ? 81 : 72;
  const minLongitude = north ? -4 : 4;
  const maxLongitude = north ? 38 : 32;
  const shape = north ? svalbard : mainland;

  for (
    let latitude = minLatitude + side / 2;
    latitude < maxLatitude;
    latitude += side
  ) {
    for (
      let x = minLongitude * longitudeScale + side / 2;
      x < maxLongitude * longitudeScale;
      x += side
    ) {
      const longitude = x / longitudeScale;
      if (booleanPointInPolygon([longitude, latitude], shape)) {
        cells.push({ longitude, latitude });
      }
    }
  }
  return cells;
}

function distance(bird: ObservedBird, cell: Cell) {
  const radians = Math.PI / 180;
  const latitudeDifference = (cell.latitude - bird.latitude) * radians;
  const longitudeDifference = (cell.longitude - bird.longitude) * radians;
  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(bird.latitude * radians) *
      Math.cos(cell.latitude * radians) *
      Math.sin(longitudeDifference / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Hungarian algorithm: assign each bird to one cell with minimum total distance.
function closestCellAssignments(birds: ObservedBird[], cells: Cell[]) {
  const costs = birds.map((bird) =>
    Float64Array.from(cells, (cell) => distance(bird, cell)),
  );
  const n = birds.length;
  const m = cells.length;
  const u = new Float64Array(n + 1);
  const v = new Float64Array(m + 1);
  const match = new Int32Array(m + 1);
  const previous = new Int32Array(m + 1);

  for (let i = 1; i <= n; i++) {
    match[0] = i;
    const minimum = new Float64Array(m + 1).fill(Infinity);
    const used = new Uint8Array(m + 1);
    let j0 = 0;

    do {
      used[j0] = 1;
      let delta = Infinity;
      let j1 = 0;
      for (let j = 1; j <= m; j++) {
        if (used[j]) continue;
        const cost = costs[match[j0] - 1][j - 1] - u[match[j0]] - v[j];
        if (cost < minimum[j]) {
          minimum[j] = cost;
          previous[j] = j0;
        }
        if (minimum[j] < delta) {
          delta = minimum[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) {
          u[match[j]] += delta;
          v[j] -= delta;
        } else {
          minimum[j] -= delta;
        }
      }
      j0 = j1;
    } while (match[j0]);

    do {
      const j1 = previous[j0];
      match[j0] = match[j1];
      j0 = j1;
    } while (j0);
  }

  const assignedColumns = new Int32Array(n);
  for (let j = 1; j <= m; j++) {
    if (match[j]) assignedColumns[match[j] - 1] = j - 1;
  }
  return assignedColumns;
}

function assignBirds(birds: ObservedBird[], cells: Cell[], side: number) {
  const ordered = [...birds].sort((a, b) => b.latitude - a.latitude);
  const assignedColumns = closestCellAssignments(ordered, cells);
  return ordered.map((bird, index) => {
    const cell = cells[assignedColumns[index]];
    return {
      id: bird.id,
      name: bird.norwegianName || bird.scientificName,
      bird: {
        id: bird.id,
        norwegianName: bird.norwegianName,
        scientificName: bird.scientificName,
        habitats: bird.habitats,
        media: bird.media && {
          englishName: bird.media.englishName,
          cardPhoto: bird.media.cardPhoto && {
            url: bird.media.cardPhoto.url,
          },
          sound: bird.media.sound && { fileUrl: bird.media.sound.fileUrl },
        },
      },
      cutoutUrl:
        bird.media?.cardPhoto?.cutoutUrl ||
        bird.media?.cardPhoto?.url ||
        "/bird-placeholder.svg",
      ...cell,
      side,
    };
  });
}

export function prepareBirdMap(birds: ObservedBird[]): BirdMapSlot[] {
  const mainlandBirds = birds.filter((bird) => bird.latitude < 74);
  const svalbardBirds = birds.filter((bird) => bird.latitude >= 74);

  let low = 0.14;
  let high = 0.5;
  for (let attempt = 0; attempt < 18; attempt++) {
    const side = (low + high) / 2;
    if (cellsFor(side, "mainland").length >= mainlandBirds.length) low = side;
    else high = side;
  }
  const side = low;
  const mainlandCells = cellsFor(side, "mainland");
  const northCells = cellsFor(side, "svalbard");
  return [
    ...assignBirds(mainlandBirds, mainlandCells, side),
    ...assignBirds(svalbardBirds, northCells, side),
  ];
}
