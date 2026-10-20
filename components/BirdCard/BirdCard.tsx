import Link from "next/link";
import type { ObservedBird } from "@/types/bird";
import "./BirdCard.css";

export default function BirdCard({ bird }: { bird: ObservedBird }) {
  const norwegianName = bird.norwegianName[0].toLocaleUpperCase("nb-NO") + bird.norwegianName.slice(1)
    
  return (
    <article className="bird-list-item">
      {bird.media?.cardPhoto ? (
        <Link className="bird-card-photo" href={`/birds/${bird.id}`}>
          <img
            src={bird.media.cardPhoto.url}
            alt={bird.norwegianName}
            loading="lazy"
          />
        </Link>
      ) : (
        <div className="bird-card-photo bird-card-photo-empty">No photo</div>
      )}
      <h3>{norwegianName}</h3>
      <p className="bird-english-name">
        {bird.media?.englishName || "English name unavailable"}
      </p>
      <p className="bird-scientific-name">
        <i>{bird.scientificName}</i>
      </p>
      {bird.media?.sound ? (
        <audio
          controls
          controlsList="nodownload noplaybackrate novolume"
          preload="none"
          src={`/api/xeno-audio?id=${bird.media.sound.id}`}
          aria-label={`${bird.norwegianName}'s recording`}
        />
      ) : (
        <p className="bird-sound-unavailable">No recording available</p>
      )}
      <Link className="bird-detail-link" href={`/birds/${bird.id}`}>
        Explore this bird
      </Link>
    </article>
  );
}
