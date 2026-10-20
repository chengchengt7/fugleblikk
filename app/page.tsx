import BirdCard from "@/components/BirdCard/BirdCard";
import HeroMessage from "@/components/HeroMessage/HeroMessage";
import saved from "@/data/observed-birds.json";
import type { ObservationSnapshot } from "@/types/bird";
import "./page.css";

export default function Home() {
  const snapshot: ObservationSnapshot = saved;
  return (
    <main className="bird-page">
      <HeroMessage
        totalSpecies={snapshot.totalSpecies}
        period={snapshot.period}
      />
      <ul className="bird-list">
        {snapshot.birds.map((bird) => (
          <li className="bird-comparison" key={bird.id}>
            <BirdCard bird={bird} />
            {bird.media?.cardPhoto?.cutoutUrl && (
              <div className="bird-cutout">
                {/* biome-ignore lint/performance/noImgElement: local cutout is already optimized as WebP */}
                <img
                  src={bird.media.cardPhoto.cutoutUrl}
                  alt={`${bird.norwegianName || bird.scientificName} cutout`}
                  loading="lazy"
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
