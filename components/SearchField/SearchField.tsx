"use client";

import { useRef, useState } from "react";
import BirdMap from "@/components/BirdMap/BirdMap";
import type { BirdMapSlot } from "@/lib/bird-map";
import type { BirdSearchResult } from "@/lib/search-birds";
import "./SearchField.css";

export default function SearchField({
  slots,
  initialQuery,
  initialResult,
}: {
  slots: BirdMapSlot[];
  initialQuery: string;
  initialResult: BirdSearchResult | null;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState(initialResult);
  const [pending, setPending] = useState(false);
  const [focusBird, setFocusBird] = useState<{ id: number } | null>(
    initialResult?.status === "found" ? { id: initialResult.birdId } : null,
  );
  const requestId = useRef(0);

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
    setFocusBird(null);
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
    setFocusBird(nextResult.status === "found" ? { id: nextResult.birdId } : null);
  }

  return (
    <>
      <BirdMap slots={slots} focusBird={focusBird} />
      <div className="search-field">
        <form
          role="search"
          aria-label="Search bird"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch(new FormData(event.currentTarget).get("q")?.toString() ?? "");
          }}
        >
          <input
            name="q"
            type="search"
            defaultValue={initialQuery}
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
    </>
  );
}
