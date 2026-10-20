# Fugleblikk

A Next.js site exploring birds reported in Norway, Svalbard/Bjørnøya, Jan Mayen
and Norwegian waters. The prepared bird data includes iNaturalist photos and
English names, transparent card-photo cutouts, Xeno-canto audio, and detail
pages with larger photos and sourced descriptions. The homepage currently shows
the collection heading; bird cards are prepared but hidden.

```sh
npm install
npm run prepare:observations
npm run dev
```

Preparation code lives in `data-preparation/`; saved datasets live in `data/`.
Set `XENO_CANTO_API_KEY` in `.env.local` to prepare media. Install Python 3.9–3.12
dependencies with `python3 -m pip install -r data-preparation/requirements-cutouts.txt`
for automatic bird cutouts. After an observation snapshot already exists,
`npm run prepare:media` updates its bird content without downloading observations
again. The monthly workflow installs these dependencies and needs the Xeno-canto
key as a GitHub Actions secret.

Use Node 24. The prepared JSON is committed with the site so visitors do not
wait for API preparation. `npm run build` verifies the site.

See [monthly preparation and schedule](docs/monthly-refresh.md) and
[data sources and geographic scope](data/README.md). The approved GitHub workflow refreshes the snapshot on the first of each month
at 04:17 Europe/Oslo after it is published on the default branch.
