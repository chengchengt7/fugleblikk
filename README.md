# Fugleblikk

A Next.js site exploring birds reported in Norway, Svalbard/Bjørnøya, Jan Mayen
and Norwegian waters. The current homepage temporarily lists observed species
with their latest usable observation coordinates.

```sh
npm install
npm run prepare:observations
npm run dev
```

Preparation code lives in `data-preparation/`; saved datasets live in `data/`.

Use Node 24. The prepared JSON is committed with the site so visitors do not
wait for API preparation. `npm run build` verifies the site.

See [monthly preparation and schedule](docs/monthly-refresh.md) and
[data sources and geographic scope](data/README.md). The approved GitHub workflow refreshes the snapshot on the first of each month
at 04:17 Europe/Oslo after it is published on the default branch.
