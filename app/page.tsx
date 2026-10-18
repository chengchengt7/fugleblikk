import { type Bird, getBirds } from "@/lib/birds";
import "./birds.css";

export default async function Home() {
  let birds: Bird[] = [];
  let errorMessage = "";

  try {
    birds = await getBirds();
  } catch {
    errorMessage =
      "Kunne ikke hente fuglelisten fra Artsdatabanken. Prøv å laste siden på nytt.";
  }

  return (
    <main className="bird-page">
      <h2>{birds.length} kandidater</h2>
        <ul className="bird-list">
          {birds.map((bird) => (
            <li className="bird-list-item" key={bird.id}>
              <h3>{bird.norwegianName}</h3>
              <p>
                <i>{bird.scientificName}</i>
              </p>
              <small>Takson-ID: {bird.id}</small>
            </li>
          ))}
        </ul>
    </main>
  );
}
