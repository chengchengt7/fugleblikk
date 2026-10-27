"use client";

import { useEffect, useRef, useState } from "react";
import type { BirdSearchResult } from "@/lib/search-birds";
import "./SearchField.css";

export default function SearchField({
  initialQuery,
  initialResult,
  onFocusBird,
}: {
  initialQuery: string;
  initialResult: BirdSearchResult | null;
  onFocusBird: (id: number | null) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState(initialResult);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function handleSearch(value: string) {
    const nextQuery = value.trim();
    const currentRequest = ++requestId.current;
    const url = new URL(window.location.href);
    if (nextQuery) url.searchParams.set("q", nextQuery);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);
    setQuery(nextQuery);
    setResult(null);
    setPending(Boolean(nextQuery));
    onFocusBird(null);
    if (!nextQuery) {
      return;
    }

    let nextResult: BirdSearchResult;
    try {
      const response = await fetch(`/api/bird-search?${new URLSearchParams({ q: nextQuery })}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Search request failed");
      nextResult = (await response.json()) as BirdSearchResult;
    } catch {
      nextResult = { status: "error" };
    }
    if (currentRequest !== requestId.current) return;
    setResult(nextResult);
    setPending(false);
    onFocusBird(nextResult.status === "found" ? nextResult.birdId : null);
  }

  return (
    <div className="search-control">
      <button
        className="map-control"
        type="button"
        aria-label={open ? "Hide search" : "Show search"}
        aria-expanded={open}
        aria-controls="bird-search"
        onClick={() => setOpen(!open)}
      >
        <img src="/icons/search.svg" alt="" />
      </button>
      <div className="search-field" id="bird-search" hidden={!open}>
        <form
          role="search"
          aria-label="Search bird"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch(new FormData(event.currentTarget).get("q")?.toString() ?? "");
          }}
        >
          <input
            ref={inputRef}
            name="q"
            type="search"
            defaultValue={initialQuery}
            aria-label="Norwegian or English bird name"
            placeholder="Norwegian or English name"
          />
          <button type="submit" disabled={pending}>Search</button>
        </form>
        <div aria-live="polite">
          {pending && <p>Searching…</p>}
          {result?.status === "empty" && <p>No birds found for “{query}”.</p>}
          {result?.status === "outside" && <p>Birds found, but none are in this map collection.</p>}
          {result?.status === "error" && <p>Search is unavailable. Please try again.</p>}
        </div>
      </div>
    </div>
  );
}
