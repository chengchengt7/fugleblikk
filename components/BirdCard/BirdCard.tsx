import Link from "next/link";
import type { BirdCardBird } from "@/types/bird";
import "./BirdCard.css";

export default function BirdCard({
  bird,
  onClose,
}: {
  bird: BirdCardBird;
  onClose: () => void;
}) {
  const norwegianName =
    bird.norwegianName[0].toLocaleUpperCase("nb-NO") +
    bird.norwegianName.slice(1);

  return (
    <article className="bird-card">
      <button
        type="button"
        className="close-button"
        onClick={onClose}
        aria-label="Close bird card"
      >
        <img src="/icons/close.svg" alt="" />
      </button>
      <Link href={`/birds/${bird.id}`}>
        {bird.media?.cardPhoto ? (
          <img
            src={bird.media.cardPhoto.url}
            alt=""
            loading="lazy"
          />
        ) : (
          <div className="photo-empty">No photo</div>
        )}
        <div className="card-content">
          <h3>{norwegianName}</h3>
          {bird.habitats.length > 0 && (
            <p className="habitats">
              <strong>Levested:</strong> {bird.habitats.join(", ")}
            </p>
          )}
          {bird.media?.englishName && (
            <p className="english-name">
              <i>{bird.media.englishName}</i>
            </p>
          )}
          <p className="scientific-name">{bird.scientificName}</p>
          {bird.media?.sound ? (
            <audio
              controls
              controlsList="nodownload noplaybackrate novolume"
              preload="none"
              src={bird.media.sound.fileUrl}
              aria-label={`${bird.norwegianName}'s recording`}
            />
          ) : (
            <p className="sound-unavailable">No recording available</p>
          )}
        </div>
      </Link>
    </article>
  );
}
