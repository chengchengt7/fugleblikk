import { getObservedBirds } from "@/lib/observed-birds";
import "./birds.css";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  }).format(new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso));
}

export default function Home() {
  const snapshot = getObservedBirds();
  return (
    <main className="bird-page">
      <p className="bird-eyebrow">Fugleblikk · Observasjoner fra Artskart</p>
      <h1>{snapshot.totalSpecies} observerte fuglearter</h1>
      <p>
        {formatDate(snapshot.period.from)}–{formatDate(snapshot.period.to)}.
      </p>
      <p>
        Fastlands-Norge med kystøyene, Svalbard og Bjørnøya, Jan Mayen og norske
        havområder. Hver art vises én gang, med sin siste tilgjengelige
        observasjon som har dato og koordinater innenfor området.
      </p>
      <p className="bird-note">
        Datasettet ble klargjort {formatDate(snapshot.preparedAt)} for månedlig
        oppdatering. Dette er rapporterte arter, ikke en kvalitetssikret
        nasjonal artsliste. Koordinater kan være omtrentlige. Ved flere funn på
        samme siste dato vises ett av dem.
      </p>
      <ul className="bird-list">
        {snapshot.birds.map((bird) => (
          <li className="bird-list-item" key={bird.id}>
            <h2>{bird.norwegianName || bird.scientificName}</h2>
            <p>
              <i>{bird.scientificName}</i>
            </p>
            <dl>
              <div>
                <dt>Sist observert</dt>
                <dd>{formatDate(bird.observedDate)}</dd>
              </div>
              <div>
                <dt>Lengdegrad</dt>
                <dd>{bird.longitude}</dd>
              </div>
              <div>
                <dt>Breddegrad</dt>
                <dd>{bird.latitude}</dd>
              </div>
              <div>
                <dt>Område</dt>
                <dd>{bird.region}</dd>
              </div>
              <div>
                <dt>Oppgitt presisjon</dt>
                <dd>
                  {bird.precisionMeters === null
                    ? "Ikke oppgitt"
                    : `${bird.precisionMeters} m`}
                </dd>
              </div>
            </dl>
            {bird.sourceUrl && (
              <a href={bird.sourceUrl} target="_blank" rel="noreferrer">
                Se observasjonen ↗
              </a>
            )}
          </li>
        ))}
      </ul>
      <footer className="bird-note">
        Observasjoner:{" "}
        <a href="https://artskart.artsdatabanken.no/">
          Artskart / Artsdatabanken
        </a>
        . Navn: Artsnavn. Geografisk avgrensning:{" "}
        <a href="https://www.marineregions.org/">Marine Regions / VLIZ</a>, land
        og maritime soner, versjon 4.
      </footer>
    </main>
  );
}
