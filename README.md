# Fugleblikk

Explore birds observed in Norway, Svalbard, Jan Mayen and Norwegian waters. Built by Chengcheng with Next.js, TypeScript and MapLibre for curious birdwatchers and nature enthusiasts.

**Live site:** [fugleblikk.vercel.app](https://fugleblikk.vercel.app/)

Select a bird on the globe to see its card, hear its call and open its detail page. Search by Norwegian or English name, or follow five illustrative migration routes.

## Assignment requirements

- **Pages:** homepage and bird overview combined, dynamic detail pages at `/birds/[name]`, and an About page.
- **Navigation:** Next.js `Link`, direct detail-page URLs, and shared header, main and footer in `layout.tsx`.
- **Data:** external APIs, typed data and props, reusable UI components, and a prepared bird collection.
- **Search:** live name lookup, automatic map navigation, and messages for no match, birds outside the collection, or API errors.
- **Usability:** responsive layouts, labelled controls, image alternative text, and fallbacks for missing content or unknown birds.

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

```sh
npm run build  # Production build
npm start      # Serve the production build
```

Set the MapTiler key in Vercel's environment settings too. Keep `.env.local` and secret keys out of Git.

## APIs and sources

| Source | Used for |
| --- | --- |
| [Artsnavn](https://nortaxa.artsdatabanken.no/api/v1) | Accepted taxonomy and Norwegian names |
| [Artsdatabanken lookup](https://lookup.artsdatabanken.no/v1/query) | Live Norwegian-name search |
| [Artskart](https://artskart.artsdatabanken.no/publicapi/) | Observation counts and records |
| [iNaturalist](https://api.inaturalist.org/v1/docs/) | English-name search, photos, names and descriptions |
| [Wikipedia](https://en.wikipedia.org/api/rest_v1/) | Description fallback |
| [Xeno-canto](https://xeno-canto.org/api/3/recordings) | Bird recordings |
| [MapTiler](https://www.maptiler.com/copyright/) | Satellite map imagery |

Habitat information comes from Artsdatabanken species pages. Geographic shapes come from [Natural Earth](https://www.naturalearthdata.com/) and [Marine Regions](https://doi.org/10.14284/698) (Flanders Marine Institute, 2024; CC BY 4.0; filtered, otherwise unchanged). Map data: [© OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## Monthly data refresh

The [GitHub Actions workflow](.github/workflows/refresh-observations.yml) is scheduled for **04:17 Europe/Oslo on the first of each month**. It prepares the previous 12 complete calendar months, updates `data/observed-birds.json` and bird cutouts, builds the site, and commits successful changes. It can also be started manually.

The workflow needs the repository secret `XENO_CANTO_API_KEY`. For local preparation, add that key to `.env.local`, install Python 3.9–3.12 and the cutout dependencies:

```sh
python3 -m pip install rembg==2.0.60 'onnxruntime>=1.19,<2'
npm run prepare:observations
```

Use `npm run prepare:media` to update media without downloading observations again. Existing media is reused where possible. Search calls live APIs; the displayed collection uses the saved monthly data.

## Limitations

- Search requires an exact Norwegian or English name, ignoring capitalisation, and only opens birds in the saved collection.
- Map positions are arranged near recorded locations; migration routes are illustrative, not live tracking.
- Some photos, recordings or descriptions may be unavailable. Map imagery, search and remote media need internet access; the globe requires WebGL2.
