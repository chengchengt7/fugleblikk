import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import BirdGallery from "@/components/BirdGallery/BirdGallery";
import { birdSlug } from "@/lib/bird-slug";
import saved from "@/data/observed-birds.json";
import type { ObservationSnapshot } from "@/types/bird";
import "./page.css";

const snapshot: ObservationSnapshot = saved;

export default async function BirdPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const bird = snapshot.birds.find(
    (item) => birdSlug(item.norwegianName) === birdSlug(name) || String(item.id) === name,
  );
  if (!bird) notFound();

  const slug = birdSlug(bird.norwegianName);
  if (name !== slug) permanentRedirect(`/birds/${encodeURIComponent(slug)}`);

  return (
    <div className="bird-detail-page">
      <Link href="/">← All birds</Link>
      <BirdGallery
        photos={bird.media?.detailPhotos ?? []}
        name={bird.norwegianName || bird.scientificName}
      />
      <div className="bird-detail-content">
        <section className="bird-details" aria-label="Bird details">
          <h1>
            {bird.norwegianName[0].toLocaleUpperCase("nb-NO") +
              bird.norwegianName.slice(1)}
          </h1>
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
          <p className="scientific-name">{bird.scientificName.trim()}</p>
          {bird.media?.sound ? (
            <>
              <audio
                controls
                controlsList="nodownload noplaybackrate novolume"
                preload="none"
                src={bird.media.sound.fileUrl}
                aria-label={`${bird.norwegianName}'s recording`}
              />
            </>
          ) : (
            <p>No recording available</p>
          )}
        </section>
        <section className="bird-description">
          <h2>About the bird</h2>
          {bird.media?.description ? (
            <>
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
            </>
          ) : (
            <p>A sourced description is not available yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
