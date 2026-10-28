# Fugleblikk

Explore birds observed in Norway. Built with Next.js, TypeScript and MapLibre for curious birdwatchers and nature enthusiasts.

**Live site:** [fugleblikk.vercel.app](https://fugleblikk.vercel.app/)

Select a bird on the globe to see its card, hear its call and open its detail page. Search by Norwegian or English name, or follow five illustrative migration routes.

## Run locally

Use **Node.js 24**. Create `.env.local`:

```env
NEXT_PUBLIC_MAPTILER_API_KEY=your_maptiler_key
```

```sh
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). The prepared data is included, so no data refresh is needed to run the site.

## APIs and sources

| Source | Used for |
| --- | --- |
| [Artsnavn / Nortaxa](https://artsdatabanken.no/aktuelt-og-innsikt/artsnavn) | Accepted taxonomy and Norwegian names |
| [Artsdatabanken lookup](https://lookup.artsdatabanken.no/) | Live Norwegian-name search |
| [Artskart](https://artsdatabanken.no/kart/artskart/dataformat-og-nedlasting-i-artskart) | Observation counts and records |
| [iNaturalist](https://api.inaturalist.org/v1/docs/) | English-name search, photos and descriptions |
| [Wikipedia page summaries](https://www.mediawiki.org/wiki/Page_Content_Service) | Description fallback |
| [Xeno-canto API documentation](https://xeno-canto.org/explore/api) | Bird recordings |
| [MapTiler Maps API](https://docs.maptiler.com/cloud/api/maps/) | Satellite map imagery |
| [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) | Displays the globe and handles map interactions |

The API endpoints used by the code are listed in [constants/api.ts](constants/api.ts).

Habitat information comes from Artsdatabanken species pages. Geographic shapes come from [Natural Earth](https://www.naturalearthdata.com/) and [Marine Regions](https://doi.org/10.14284/698) (Flanders Marine Institute, 2024; CC BY 4.0; filtered, otherwise unchanged).

## Monthly data refresh

The [GitHub Actions workflow](.github/workflows/refresh-observations.yml) is scheduled for **00:00 Europe/Oslo on the first of each month**. It prepares the previous 12 complete calendar months, updates `data/observed-birds.json` and bird cutouts, builds the site, and commits successful changes. It can also be started manually.

## Limitations

- Search requires an exact Norwegian or English name (live API search rather than search within collections). Only birds in the saved collection will appear in the results.
- Birds are arranged in a grid near recorded locations. Because observations are unevenly distributed, the layout calculation places some birds farther from their recorded locations than others. Migration routes are illustrative, not live tracking.
- Some photos, recordings or descriptions may be unavailable. Map imagery, search and remote media need internet access; the globe requires WebGL2.
- Bird recordings may be temporarily unavailable during Xeno-canto site maintenance.
