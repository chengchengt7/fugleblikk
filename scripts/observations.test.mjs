import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  createTaxonomy,
  getMonths,
  getPeriod,
  parseDate,
  selectLatest,
} from "./lib/observation-rules.mjs";

const scope = JSON.parse(
  readFileSync(new URL("../data/norwegian-scope.geojson", import.meta.url)),
);
const bird = { id: 1, norwegianName: "Testfugl", scientificName: "Avis test" };
const period = { from: "2025-10-01", to: "2026-09-30" };
const observation = {
  Id: "b",
  CollectedDate: "10.09.2026",
  Longitude: "10,75",
  Latitude: "59,91",
  Precision: null,
};

test("rolling year ends before the current Oslo month, including timezone and leap years", () => {
  assert.deepEqual(getPeriod(new Date("2026-10-19T12:00:00Z")), period);
  assert.deepEqual(getPeriod(new Date("2026-10-31T23:30:00Z")), {
    from: "2025-11-01",
    to: "2026-10-31",
  });
  assert.deepEqual(getPeriod(new Date("2024-03-01T12:00:00Z")), {
    from: "2023-03-01",
    to: "2024-02-29",
  });
  const months = getMonths(period);
  assert.equal(months.length, 12);
  assert.deepEqual(months[0], { from: "2026-09-01", to: "2026-09-30" });
  assert.deepEqual(months[11], { from: "2025-10-01", to: "2025-10-31" });
});

test("impossible dates, missing coordinates and outside locations are excluded", () => {
  assert.equal(parseDate("31.02.2026"), null);
  const latest = new Map();
  assert.equal(
    selectLatest(
      latest,
      { ...observation, Longitude: "" },
      bird,
      period,
      scope,
    ),
    "coordinates",
  );
  assert.equal(
    selectLatest(
      latest,
      { ...observation, Latitude: "0", Longitude: "0" },
      bird,
      period,
      scope,
    ),
    "outsideScope",
  );
  assert.equal(
    selectLatest(
      latest,
      { ...observation, CollectedDate: "01.10.2026" },
      bird,
      period,
      scope,
    ),
    "date",
  );
  assert.equal(latest.size, 0);
});

test("latest usable location wins, with a consistent same-day tie break", () => {
  const latest = new Map();
  selectLatest(latest, observation, bird, period, scope);
  selectLatest(
    latest,
    { ...observation, Id: "c", CollectedDate: "09.09.2026" },
    bird,
    period,
    scope,
  );
  assert.equal(latest.get(1).observationId, "b");
  selectLatest(latest, { ...observation, Id: "a" }, bird, period, scope);
  assert.equal(latest.get(1).observationId, "a");
  selectLatest(
    latest,
    { ...observation, CollectedDate: "30.09.2026", Latitude: "", Id: "d" },
    bird,
    period,
    scope,
  );
  assert.equal(latest.get(1).observedDate, "2026-09-10");
});

test("mainland, Svalbard, Bjørnøya, Jan Mayen and offshore water are inside; foreign areas are outside", () => {
  for (const [longitude, latitude] of [
    [10.75, 59.91],
    [15.65, 78.22],
    [19.0, 74.43],
    [-8.15, 70.98],
    [3, 65],
  ]) {
    assert.equal(
      selectLatest(
        new Map(),
        { ...observation, Longitude: longitude, Latitude: latitude },
        bird,
        period,
        scope,
      ),
      "selected",
      `${longitude},${latitude}`,
    );
  }
  for (const [longitude, latitude] of [
    [18.06, 59.33],
    [-21.94, 64.15],
    [2.35, 48.86],
  ]) {
    assert.equal(
      selectLatest(
        new Map(),
        { ...observation, Longitude: longitude, Latitude: latitude },
        bird,
        period,
        scope,
      ),
      "outsideScope",
    );
  }
});

test("subspecies and synonyms count as their accepted parent, not extra species", () => {
  const rows = [
    {
      TaxonId: "1",
      ScientificNameId: "10",
      Rank: "Species",
      TaxonomicStatus: "Accepted",
      PresentationName: "Avis test",
      ExistsInNorway: "False",
    },
    {
      TaxonId: "2",
      ScientificNameId: "20",
      Rank: "Subspecies",
      TaxonomicStatus: "Accepted",
      ParentScientificNameId: "10",
    },
    {
      TaxonId: "3",
      ScientificNameId: "30",
      Rank: "Species",
      TaxonomicStatus: "Synonym",
      AcceptedScientificNameId: "10",
    },
  ];
  const resolve = createTaxonomy(rows);
  assert.equal(resolve(1).id, 1);
  assert.equal(resolve(2).id, 1);
  assert.equal(resolve(3).id, 1);
  assert.equal(resolve(999), null);
});
