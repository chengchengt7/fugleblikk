import Link from "next/link";
import BirdSoundMix from "@/components/BirdSoundMix/BirdSoundMix";
import MigrationControls, { type MigrationSelection } from "@/components/MigrationControls/MigrationControls";
import SearchField from "@/components/SearchField/SearchField";
import type { BirdSearchResult } from "@/lib/search-birds";
import "./MapToolbar.css";

export default function MapToolbar({
  recordings,
  migration,
  panelContainer,
  onProgress,
  onMigrationSelect,
  onLocate,
  initialQuery,
  initialResult,
  onFocusBird,
}: {
  recordings: string[];
  migration: MigrationSelection;
  panelContainer: HTMLDivElement | null;
  onProgress: (progress: number) => void;
  onMigrationSelect: (selection: MigrationSelection) => void;
  onLocate: () => void;
  initialQuery: string;
  initialResult: BirdSearchResult | null;
  onFocusBird: (id: number | null) => void;
}) {
  return (
    <div className="map-toolbar" role="group" aria-label="Map controls">
      <BirdSoundMix recordings={recordings} />
      <MigrationControls
        active={migration}
        panelContainer={panelContainer}
        onProgress={onProgress}
        onSelect={onMigrationSelect}
      />
      <SearchField
        initialQuery={initialQuery}
        initialResult={initialResult}
        onFocusBird={onFocusBird}
      />
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
