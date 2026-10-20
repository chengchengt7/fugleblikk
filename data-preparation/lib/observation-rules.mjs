import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

// Use Oslo's current month, regardless of the server's timezone.
export function getPeriod(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year").value);
  const month = Number(parts.find((part) => part.type === "month").value);
  return {
    from: new Date(Date.UTC(year - 1, month - 1, 1)).toISOString().slice(0, 10),
    to: new Date(Date.UTC(year, month - 1, 0)).toISOString().slice(0, 10),
  };
}

export function getMonths(period) {
  const months = [];
  let cursor = new Date(`${period.to}T12:00:00Z`);
  while (cursor.toISOString().slice(0, 10) >= period.from) {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth();
    months.push({
      from: new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10),
      to: new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10),
    });
    cursor = new Date(Date.UTC(year, month - 1, 1));
  }
  return months;
}

export function parseDate(value) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value ?? "");
  if (!match) return null;
  const iso = `${match[3]}-${match[2]}-${match[1]}`;
  const date = new Date(`${iso}T00:00:00Z`);
  return Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === iso
    ? iso
    : null;
}

export function parseCoordinate(value) {
  if (value == null || String(value).trim() === "") return NaN;
  return Number(String(value).replace(",", "."));
}

// Accepted species only; subspecies and synonyms point to their parent species.
// ExistsInNorway is deliberately not used: observations establish occurrence.
export function createTaxonomy(rows) {
  const byTaxon = new Map(rows.map((row) => [Number(row.TaxonId), row]));
  const byName = new Map(
    rows.map((row) => [Number(row.ScientificNameId), row]),
  );
  return function resolve(taxonId, scientificNameId) {
    let row =
      byTaxon.get(Number(taxonId)) ?? byName.get(Number(scientificNameId));
    const visited = new Set();
    while (row && !visited.has(row.ScientificNameId)) {
      visited.add(row.ScientificNameId);
      if (row.TaxonomicStatus !== "Accepted") {
        row = byName.get(Number(row.AcceptedScientificNameId));
      } else if (row.Rank === "Species") {
        return {
          id: Number(row.TaxonId),
          norwegianName: row.VernacularNameBokmaal || null,
          scientificName: row.PresentationName,
        };
      } else {
        row = byName.get(Number(row.ParentScientificNameId));
      }
    }
    return null;
  };
}

export function selectLatest(latest, observation, bird, period, scope) {
  if (!observation.Id || !bird) return "unidentified";
  const date = parseDate(observation.CollectedDate);
  if (!date || date < period.from || date > period.to) return "date";
  const longitude = parseCoordinate(observation.Longitude);
  const latitude = parseCoordinate(observation.Latitude);
  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude) ||
    Math.abs(longitude) > 180 ||
    Math.abs(latitude) > 90
  )
    return "coordinates";
  const previous = latest.get(bird.id);
  // Earlier months can never replace a later usable observation.
  if (
    previous &&
    (date < previous.observedDate ||
      (date === previous.observedDate &&
        observation.Id >= previous.observationId))
  )
    return "older";
  if (
    !scope.features.some((feature) =>
      booleanPointInPolygon([longitude, latitude], feature),
    )
  )
    return "outsideScope";
  latest.set(bird.id, {
    ...bird,
    observedDate: date,
    longitude,
    latitude,
    observationId: observation.Id,
  });
  return "selected";
}
