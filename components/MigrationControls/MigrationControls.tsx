"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { migrationRoutes } from "@/data/migration-routes";
import "./MigrationControls.css";

export type MigrationSelection = "all" | number | null;

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function MigrationControls({
  active,
  panelContainer,
  onSelect,
  onProgress,
}: {
  active: MigrationSelection;
  panelContainer: HTMLDivElement | null;
  onSelect: (selection: MigrationSelection) => void;
  onProgress: (progress: number) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const progressRef = useRef(0);

  useEffect(() => {
    if (!playing || active === null) return;
    let frame: number;
    let previous = performance.now();
    const tick = (now: number) => {
      progressRef.current = (progressRef.current + Math.min(now - previous, 64) / 1200) % 12;
      previous = now;
      setProgress(progressRef.current);
      onProgress(progressRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, playing, onProgress]);

  function choose(selection: MigrationSelection) {
    progressRef.current = 0;
    setProgress(0);
    onProgress(0);
    onSelect(selection);
    setPlaying(selection !== null && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  const month = months[Math.floor(progress) % 12];
  const sources = active === "all" ? migrationRoutes : active === null ? [] : [migrationRoutes[active]];

  return (
    <>
      <button
        className="map-control"
        type="button"
        aria-label={active === null ? "Show migration" : "Close migration"}
        aria-expanded={active !== null}
        onClick={() => choose(active === null ? "all" : null)}
      >
        <svg viewBox="0 0 24 24" fill={active === null ? "none" : "var(--color-primary-light)"} stroke={active === null ? "currentColor" : "var(--color-primary-light)"} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
          <g transform="translate(24 0) scale(-1 1)">
            <path d="M4.5 20.5 8.5 8C10 4.5 12 3 15 3c2.3 0 3.3 1.3 5.2 2.6l-1.5 1.6c-.9.9-.8 2-.1 4 1 3.6-1.3 6-5.3 6.6l-4-.8-2.6 3L4.5 20.5Z" />
          </g>
        </svg>
      </button>
      {active !== null && panelContainer && createPortal(
        <div className="migration-panel">
          <div className="migration-birds" aria-label="Choose migrating birds">
            <button type="button" aria-pressed={active === "all"} onClick={() => choose("all")}>All birds</button>
            {migrationRoutes.map((route, index) => (
              <button key={route.id} type="button" aria-pressed={active === index} onClick={() => choose(index)}>
                <span className="migration-swatch" style={{ backgroundColor: route.color }} aria-hidden="true" />
                {route.name}
              </button>
            ))}
          </div>
          <label htmlFor="migration-month">{month}</label>
          <div className="migration-timeline">
            <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause migration" : "Play migration"}>
              <img src={playing ? "/icons/pause.svg" : "/icons/play.svg"} alt="" />
            </button>
            <input
              id="migration-month"
              type="range"
              min="0"
              max="12"
              step="0.01"
              value={progress}
              aria-valuetext={month}
              onChange={(event) => {
                const next = Number(event.target.value);
                progressRef.current = next;
                setProgress(next);
                onProgress(next);
                setPlaying(false);
              }}
            />
          </div>
        </div>,
        panelContainer,
      )}
    </>
  );
}
