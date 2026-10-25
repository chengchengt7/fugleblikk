import type { ReactNode } from "react";
import Link from "next/link";
import BirdSoundMix from "@/components/BirdSoundMix/BirdSoundMix";
import MigrationControls, { type MigrationSelection } from "@/components/MigrationControls/MigrationControls";
import "./MapToolbar.css";

export default function MapToolbar({
  recordings,
  migration,
  onProgress,
  onMigrationSelect,
  onLocate,
  searchControl,
}: {
  recordings: string[];
  migration: MigrationSelection;
  onProgress: (progress: number) => void;
  onMigrationSelect: (selection: MigrationSelection) => void;
  onLocate: () => void;
  searchControl: ReactNode;
}) {
  return (
    <div className="map-toolbar" role="group" aria-label="Map controls">
      <BirdSoundMix recordings={recordings} />
      <MigrationControls
        active={migration}
        onProgress={onProgress}
        onSelect={onMigrationSelect}
      />
      {searchControl}
      <button
        className="map-control"
        type="button"
        onClick={onLocate}
        aria-label="Return to your location or Oslo"
      >
        <img src="/icons/near-me.svg" alt="" />
      </button>
      <Link className="map-control" href="/about" aria-label="About Fugleblikk">
        <img src="/icons/info.svg" alt="" />
      </Link>
    </div>
  );
}
