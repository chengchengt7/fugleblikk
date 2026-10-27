import type { Metadata } from "next";
import Link from "next/link";
import saved from "@/data/observed-birds.json";
import type { ObservationSnapshot } from "@/types/bird";
import "./page.css";

export const metadata: Metadata = { title: "About | Fugleblikk" };
const snapshot: ObservationSnapshot = saved;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

export default function AboutPage() {
  return (
    <div className="about-page">
      <Link href="/">← Back to the globe</Link>
      <h1>About Fugleblikk</h1>
      <p>
        Fugleblikk helps curious birdwatchers explore{" "}
        <span className="highlight">{snapshot.totalSpecies}</span> bird
        species observed in Norway, Svalbard, Jan Mayen and Norwegian waters from{" "}
        <span className="highlight">{formatDate(snapshot.period.from)}</span> to{" "}
        <span className="highlight">{formatDate(snapshot.period.to)}</span>.
        Search by Norwegian or English name, or select a bird on the globe.
      </p>
      <p>
        A monthly update fetches names from <a href="https://nortaxa.artsdatabanken.no/">Artsnavn</a> and
        observations from <a href="https://artskart.artsdatabanken.no/publicapi/">Artskart</a>.
        It counts each species with a valid location once and maps its latest observation.
        Photos and English names come from <a href="https://www.inaturalist.org/">iNaturalist</a>,
        sounds from <a href="https://xeno-canto.org/">Xeno-canto</a>. Migration
        routes are illustrative. Built by Chengcheng.
      </p>
    </div>
  );
}
