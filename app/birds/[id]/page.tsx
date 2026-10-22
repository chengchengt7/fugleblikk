import Link from "next/link";
import { notFound } from "next/navigation";
import saved from "@/data/observed-birds.json";
import type { ObservationSnapshot } from "@/types/bird";
import "./page.css";

const snapshot: ObservationSnapshot = saved;

export default async function BirdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bird = snapshot.birds.find((item) => String(item.id) === id);
  if (!bird) notFound();

  return (
    <main className="bird-detail-page">
      <Link href="/">← All birds</Link>
      <header>
        <h1>
          {bird.norwegianName[0].toLocaleUpperCase("nb-NO") +
            bird.norwegianName.slice(1)}
        </h1>
        {bird.media?.englishName && <p>{bird.media.englishName}</p>}
        <i>{bird.scientificName.trim()}</i>
      </header>
      {bird.media?.description ? (
        <section className="bird-description">
          <h2>About this bird</h2>
          <p>{bird.media.description.text}</p>
          {bird.media.description.sourceUrl && (
            <a
              href={bird.media.description.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Read at {bird.media.description.sourceName} ↗
            </a>
          )}
        </section>
      ) : (
        <p>A sourced description is not available yet.</p>
      )}
      <section>
        <h2>Photos</h2>
        <div className="bird-detail-gallery">
          {(bird.media?.detailPhotos || []).map((photo) => (
            <figure key={photo.sourceUrl}>
              <img
                src={photo.url}
                alt={bird.norwegianName || bird.scientificName}
                loading="lazy"
              />
              <figcaption>
                <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
                  {photo.attribution} · {photo.license} ↗
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
        {!bird.media?.detailPhotos.length && (
          <p>No licensed photos available.</p>
        )}
      </section>
      {bird.media?.sound && (
        <section>
          <h2>Sound</h2>
          <audio
            controls
            controlsList="nodownload noplaybackrate novolume"
            preload="none"
            src={bird.media.sound.fileUrl}
          />
          <p>
            <a
              href={bird.media.sound.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              Recording by {bird.media.sound.recordist} ·{" "}
              {bird.media.sound.type} ↗
            </a>
          </p>
        </section>
      )}
    </main>
  );
}
