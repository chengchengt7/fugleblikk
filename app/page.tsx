import BirdMap from "@/components/BirdMap/BirdMap";
import BirdSoundMix from "@/components/BirdSoundMix/BirdSoundMix";
import HeroMessage from "@/components/HeroMessage/HeroMessage";
import saved from "@/data/observed-birds.json";
import { prepareBirdMap } from "@/lib/bird-map";
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
      <BirdSoundMix
        recordings={snapshot.birds.flatMap((bird) =>
          bird.media?.sound ? [bird.media.sound.fileUrl] : [],
        )}
      />
      <BirdMap slots={prepareBirdMap(snapshot.birds)} />
    </main>
  );
}
