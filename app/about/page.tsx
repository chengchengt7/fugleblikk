import type { Metadata } from "next";
import Link from "next/link";
import "./page.css";

export const metadata: Metadata = { title: "About | Fugleblikk" };

export default function AboutPage() {
  return (
    <div className="about-page">
      <Link href="/">← Back to the globe</Link>
      <h1>About Fugleblikk</h1>
      <p>
        Explore Norway's birdlife with Fugleblikk, an interactive globe for
        curious birdwatchers and nature enthusiasts. Select a bird to see its
        card, hear its call and discover more on its detail page. Search by
        Norwegian or English name, or follow five illustrative migration routes
        across the globe.
      </p>
      <p>
        The collection is updated monthly using names from{" "}
        <a href="https://nortaxa.artsdatabanken.no/">Artsnavn</a> and observations
        from <a href="https://artskart.artsdatabanken.no/">Artskart</a>.{" "}
        <a href="https://artsdatabanken.no/">Artsdatabanken</a> provides habitat
        information, while its <a href="https://lookup.artsdatabanken.no/">lookup API</a>{" "}
        supports Norwegian-name searches.{" "}
        <a href="https://www.inaturalist.org/">iNaturalist</a> supplies photos,
        English names and search, with descriptions from{" "}
        <a href="https://www.wikipedia.org/">Wikipedia</a> and recordings from{" "}
        <a href="https://xeno-canto.org/">Xeno-canto</a>.
      </p>
      <p>
        The globe combines <a href="https://www.maptiler.com/">MapTiler</a>{" "}
        satellite imagery with geographic shapes from{" "}
        <a href="https://www.naturalearthdata.com/">Natural Earth</a> and{" "}
        <a href="https://doi.org/10.14284/698">Marine Regions</a>.
        Built by Chengcheng with Next.js, TypeScript and{" "}
        <a href="https://maplibre.org/maplibre-gl-js/docs/">MapLibre</a>.
      </p>
    </div>
  );
}
