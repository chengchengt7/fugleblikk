"use client";

import { useEffect, useRef, useState } from "react";

export default function BirdSoundMix({ recordings }: { recordings: string[] }) {
  const [playing, setPlaying] = useState(false);
  const players = useRef<HTMLAudioElement[]>([]);

  useEffect(() => {
    setPlaying(false);
    return () => {
      for (const player of players.current) {
        player.pause();
        player.removeAttribute("src");
        player.load();
      }
      players.current = [];
    };
  }, []);

  function stop() {
    for (const player of players.current) {
      player.pause();
      player.removeAttribute("src");
      player.load();
    }
    players.current = [];
    setPlaying(false);
  }

  function start() {
    const pool = [...recordings];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    if (pool.length === 0) return;

    let next = 0;
    const voiceCount = Math.min(4, pool.length);
    for (let voice = 0; voice < voiceCount; voice++) {
      const player = new Audio();
      player.volume = 0.2;
      const playNext = () => {
        player.src = pool[next % pool.length];
        next++;
        void player.play().catch(() => {});
      };
      player.onended = playNext;
      players.current.push(player);
      playNext();
    }
    setPlaying(true);
  }

  return (
    <button
      className="map-control"
      type="button"
      aria-pressed={playing}
      aria-label={playing ? "Pause bird sounds" : "Play bird sounds"}
      onClick={playing ? stop : start}
    >
      <img src={playing ? "/icons/pause.svg" : "/icons/play.svg"} alt="" />
    </button>
  );
}
