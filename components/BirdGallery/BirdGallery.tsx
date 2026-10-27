"use client";

import { useEffect, useRef, useState } from "react";
import "./BirdGallery.css";

export default function BirdGallery({ photos, name }: {
  photos: { url: string }[];
  name: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);

  return (
    <>
      <section className="bird-detail-gallery" aria-label="Bird photos">
        {photos.slice(0, 4).map((photo, index) => (
          <button
            key={photo.url}
            type="button"
            aria-label={`Enlarge photo ${index + 1} of ${name}`}
            onClick={() => setSelected(photo.url)}
          >
            <img src={photo.url} alt={name} loading="lazy" />
          </button>
        ))}
        {!photos.length && <p>No licensed photos available.</p>}
      </section>
      <dialog
        ref={dialog}
        className="bird-photo-modal"
        aria-label={`Photo of ${name}`}
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <button
          className="map-control"
          type="button"
          aria-label="Close photo"
          onClick={() => dialog.current?.close()}
        >
          <img src="/icons/close.svg" alt="" />
        </button>
        {selected && <img className="full-photo" src={selected} alt={name} />}
      </dialog>
    </>
  );
}
