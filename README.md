# Fugleblikk

A Next.js site exploring birds reported in Norway, Svalbard/Bjørnøya, Jan Mayen
and Norwegian waters. The prepared bird data includes iNaturalist photos and
English names, transparent card-photo cutouts, Xeno-canto audio, and detail
pages with larger photos and sourced descriptions. The homepage displays bird
cutouts in a land-based mosaic on a rotatable globe; bird cards remain available
as a component.

```sh
npm install
npm run prepare:observations
npm run dev
```

Preparation code lives in `data-preparation/`; saved datasets live in `data/`.
Set `XENO_CANTO_API_KEY` in `.env.local` to prepare media. For automatic bird
cutouts, use Python 3.9–3.12 and run
`python3 -m pip install rembg==2.0.60 'onnxruntime>=1.19,<2'`.
After an observation snapshot already exists,
`npm run prepare:media` updates its bird content without downloading observations
again. The monthly workflow installs these dependencies and needs the Xeno-canto
key as a GitHub Actions secret.

Use Node 24. The prepared JSON is committed with the site so visitors do not
wait for API preparation. `npm run build` verifies the site.

The [GitHub workflow](.github/workflows/refresh-observations.yml) refreshes the
snapshot on the first of each month at 04:17 Europe/Oslo after it is published
on the default branch.

## Data

`data/observed-birds.json` stores one entry per accepted species, using its latest
usable public observation from the previous 12 complete Oslo calendar months.
All public Artskart providers and precision bands are considered; invalid or
out-of-scope records are excluded. Ties use the smallest observation ID.
Refreshes reuse existing media and cutouts, and failures leave the previous
snapshot intact.
Names and taxonomy come from [Artsnavn](https://nortaxa.artsdatabanken.no/);
observations come from [Artskart](https://artskart.artsdatabanken.no/publicapi/).

`data/norwegian-scope.geojson` is a filtered subset of Flanders Marine Institute
(2024), [Union of the ESRI Country shapefile and the Exclusive Economic Zones,
version 4](https://doi.org/10.14284/698), from [Marine Regions](https://www.marineregions.org/)
([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)). It selects Norway,
Svalbard/Bjørnøya and Jan Mayen land, maritime zones and shared regimes;
the original geometries are unchanged.

The globe renders MapTiler satellite tiles with MapLibre. Add your own
`NEXT_PUBLIC_MAPTILER_API_KEY` to `.env.local` before building or running the
site. The bird mosaic uses Natural Earth [1:50m country geometry](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/).

## Map attribution

Globe imagery: [© MapTiler](https://www.maptiler.com/copyright/).
Map data: [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
MapTiler's Free plan also requires the linked MapTiler logo and these credits to
remain visible on the map.
