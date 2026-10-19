import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { gunzipSync, gzipSync } from "node:zlib";
import { parse } from "csv-parse/sync";
import {
  BIRD_OBSERVATION_SUMMARY_API_ENDPOINT,
  BIRD_OBSERVATIONS_API_ENDPOINT,
  OBSERVED_TAXONOMY_API_ENDPOINT,
} from "../../constants/api.ts";

export async function request(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(120000),
      });
      if (response.ok) return response;
      if (response.status !== 429 && response.status < 500)
        throw new Error(`HTTP ${response.status}: ${url}`);
    } catch (error) {
      if (attempt === 3) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 3000));
  }
  throw new Error(`Source unavailable: ${url}`);
}

export async function loadTaxonomy() {
  const response = await request(OBSERVED_TAXONOMY_API_ENDPOINT);
  return parse(await response.text(), {
    columns: true,
    delimiter: ";",
    bom: true,
    skip_empty_lines: true,
  });
}

// Calendar-year summary is only a candidate list. Exact month/date checks follow.
export async function getCandidates(period) {
  const ids = new Set();
  for (let page = 0; ; page++) {
    const url = new URL(BIRD_OBSERVATION_SUMMARY_API_ENDPOINT);
    url.search = new URLSearchParams({
      "TaxonIds[]": "252",
      IncludeSubTaxonIds: "true",
      YearFrom: period.from.slice(0, 4),
      YearTo: period.to.slice(0, 4),
      sortColumn: "count",
      ascending: "false",
      page: String(page),
      pagesize: "1000",
    });
    const data = await (await request(url)).json();
    if (!Array.isArray(data.Item1) || !Number.isInteger(data.Item2))
      throw new Error("Unexpected species summary");
    for (const row of data.Item1) ids.add(row.Type);
    if ((page + 1) * 1000 >= data.Item2) break;
  }
  return [...ids];
}

export async function getPage(month, taxons, pageIndex, cache) {
  const url = new URL(BIRD_OBSERVATIONS_API_ENDPOINT);
  url.search = new URLSearchParams({
    pageIndex: String(pageIndex),
    pageSize: "10000",
    crs: "EPSG:4326",
    "filter.includeChildTaxons": "true",
    "filter.fromDate": month.from,
    "filter.toDate": month.to,
    "filter.includeObsNoPrec": "true",
  });
  for (const id of taxons) url.searchParams.append("filter.taxons", String(id));
  for (const band of [0, 1, 2, 3, 4])
    url.searchParams.append("filter.precision", String(band));
  const key = createHash("sha256").update(url.href).digest("hex");
  const path = `${cache}/${key}.json.gz`;
  let data;
  try {
    data = JSON.parse(gunzipSync(await readFile(path)));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const response = await request(url);
    data = await response.json();
    if (
      !Array.isArray(data.Observations) ||
      data.PageIndex !== pageIndex ||
      data.PageSize !== 10000 ||
      !Number.isInteger(data.TotalPages)
    )
      throw new Error("Unexpected observation page");
    // Retain no observer names, notes or other unnecessary personal information.
    data.Observations = data.Observations.map((o) => ({
      Id: o.Id,
      TaxonId: o.TaxonId,
      ScientificNameId: o.ScientificNameId,
      CollectedDate: o.CollectedDate,
      Longitude: o.Longitude,
      Latitude: o.Latitude,
      ObsUrl: o.ObsUrl,
      DetailUrl: o.DetailUrl,
    }));
    await mkdir(cache, { recursive: true });
    await writeFile(`${path}.tmp`, gzipSync(JSON.stringify(data)));
    await rename(`${path}.tmp`, path);
  }
  return data;
}
