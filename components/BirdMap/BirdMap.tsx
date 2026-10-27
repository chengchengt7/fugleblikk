"use client";

import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import type { MultiPolygon } from "geojson";
import { LngLatBounds, Map as MapLibreMap, Marker, Popup, setWorkerUrl } from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import BirdCard from "@/components/BirdCard/BirdCard";
import MapToolbar from "@/components/MapToolbar/MapToolbar";
import type { MigrationSelection } from "@/components/MigrationControls/MigrationControls";
import { MAPTILER_SATELLITE_TILEJSON_ENDPOINT } from "@/constants/api";
import { migrationRoutes } from "@/data/migration-routes";
import norwayLand from "@/data/norway-land.json";
import type { BirdMapSlot } from "@/lib/bird-map";
import type { BirdSearchResult } from "@/lib/search-birds";
import type { BirdCardBird } from "@/types/bird";
import "./BirdMap.css";

const oslo: [number, number] = [10.75, 59.91];
const osloZoom = 5.8;
const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

function positionAt(positions: [number, number][], progress: number): [number, number] {
  const month = Math.floor(progress) % 12;
  const start = positions[month];
  const end = positions[(month + 1) % 12];
  const fraction = progress - Math.floor(progress);
  return [
    start[0] + (end[0] - start[0]) * fraction,
    start[1] + (end[1] - start[1]) * fraction,
  ];
}

export default function BirdMap({
  slots,
  recordings,
  initialQuery,
  initialResult,
}: {
  slots: BirdMapSlot[];
  recordings: string[];
  initialQuery: string;
  initialResult: BirdSearchResult | null;
}) {
  const [focusBird, setFocusBird] = useState<{ id: number } | null>(
    initialResult?.status === "found" ? { id: initialResult.birdId } : null,
  );
  const [migrationPanel, setMigrationPanel] = useState<HTMLDivElement | null>(null);
  const [mapSlots] = useState(() => slots);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const birdMarkers = useRef(new Map<number, { button: HTMLButtonElement; coordinates: [number, number] }>());
  const focusBirdRef = useRef(focusBird);
  const homeCenter = useRef<[number, number]>(oslo);
  const [unsupported, setUnsupported] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [activeMigration, setActiveMigration] = useState<MigrationSelection>(null);
  const migrationMarkers = useRef(new Map<number, Marker>());
  const migrationProgress = useRef(0);
  const migrationActive = useRef(false);
  const [selected, setSelected] = useState<{
    bird: BirdCardBird;
    container: HTMLDivElement;
    popup: Popup;
  } | null>(null);

  const moveMigrationMarkers = useCallback((progress: number) => {
    migrationProgress.current = progress;
    for (const [index, marker] of migrationMarkers.current) {
      marker.setLngLat(positionAt(migrationRoutes[index].positions, progress));
    }
  }, []);

  useEffect(() => {
    focusBirdRef.current = focusBird;
  }, [focusBird]);

  useEffect(() => {
    if (!maptilerKey || !mapContainer.current) return;
    if (!document.createElement("canvas").getContext("webgl2")) {
      setUnsupported(true);
      return;
    }

    setWorkerUrl("/maplibre-gl-worker.mjs");
    const map = new MapLibreMap({
      container: mapContainer.current,
      center: oslo,
      zoom: osloZoom,
      minZoom: 0,
      maxZoom: 16,
      renderWorldCopies: false,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          satellite: {
            type: "raster",
            url: `${MAPTILER_SATELLITE_TILEJSON_ENDPOINT}?key=${maptilerKey}`,
          },
        },
        layers: [{ id: "satellite", type: "raster", source: "satellite" }],
      },
    });
    mapRef.current = map;
    let disposed = false;
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        if (
          !disposed &&
          focusBirdRef.current === null &&
          !migrationActive.current &&
          booleanPointInPolygon(
            [coords.longitude, coords.latitude],
            norwayLand as MultiPolygon,
          )
        ) {
          homeCenter.current = [coords.longitude, coords.latitude];
          map.flyTo({ center: homeCenter.current });
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 8000 },
    );
    map.on("style.load", () => {
      map.setProjection({ type: "globe" });
      map.setSky({
        "sky-color": getComputedStyle(document.documentElement)
          .getPropertyValue("--color-900")
          .trim(),
        "atmosphere-blend": 0,
      });
      setMapReady(true);
    });

    let openPopup: Popup | null = null;
    const addMarker = (element: HTMLElement, coordinates: [number, number]) =>
      new Marker({ element, anchor: "center", opacityWhenCovered: 0 })
        .setLngLat(coordinates)
        .addTo(map);

    const markers = mapSlots.map((slot) => {
      const coordinates: [number, number] = [slot.longitude, slot.latitude];
      const shadow = document.createElement("div");
      shadow.className = "bird-shadow";
      shadow.setAttribute("aria-hidden", "true");
      const shadowPhoto = document.createElement("img");
      shadowPhoto.src = slot.cutoutUrl;
      shadowPhoto.alt = "";
      shadowPhoto.loading = "lazy";
      shadow.append(shadowPhoto);
      const shadowMarker = addMarker(shadow, coordinates);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "bird";
      button.setAttribute("aria-label", `Show ${slot.name}`);
      button.dataset.name = slot.name;
      const photo = document.createElement("img");
      photo.src = slot.cutoutUrl;
      photo.alt = "";
      photo.loading = "lazy";
      button.append(photo);
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openPopup?.remove();
        const container = document.createElement("div");
        const popup = new Popup({
          closeButton: false,
          maxWidth: "none",
          offset: 25,
        })
          .setLngLat(coordinates)
          .setDOMContent(container)
          .addTo(map);
        popup.on("close", () => {
          if (openPopup === popup) openPopup = null;
          setSelected((current) =>
            current?.container === container ? null : current,
          );
        });
        openPopup = popup;
        setSelected({ bird: slot.bird, container, popup });
      });
      const marker = addMarker(button, coordinates);
      birdMarkers.current.set(slot.id, { button, coordinates });
      return { marker, shadowMarker, button, shadow, side: slot.side };
    });

    const sizeBirds = () => {
      const center = map.getCenter();
      const top = map.project([center.lng, center.lat + 0.25]);
      const bottom = map.project([center.lng, center.lat]);
      const pixelsPerDegree = Math.abs(top.y - bottom.y) * 4;
      for (const { button, shadow, side } of markers) {
        const width = `${Math.max(2, Math.min(120, side * pixelsPerDegree))}px`;
        button.style.width = width;
        shadow.style.width = width;
      }
    };
    map.on("zoom", sizeBirds);
    map.on("moveend", sizeBirds);
    sizeBirds();

    return () => {
      disposed = true;
      openPopup?.remove();
      for (const { marker, shadowMarker } of markers) {
        marker.remove();
        shadowMarker.remove();
      }
      map.remove();
      mapRef.current = null;
      birdMarkers.current.clear();
    };
  }, [mapSlots]);

  useEffect(() => {
    if (activeMigration === null || !mapReady || !mapRef.current) return;
    const map = mapRef.current;
    map.resize();
    const routes = migrationRoutes
      .map((route, index) => ({ route, index }))
      .filter(({ index }) => activeMigration === "all" || index === activeMigration);
    const bounds = new LngLatBounds();
    for (const { route } of routes) {
      for (const position of route.positions) bounds.extend(position);
    }
    const fitRoutes = (duration: number) => {
      map.stop();
      map.fitBounds(bounds, { padding: 80, maxZoom: 3.5, duration });
    };
    fitRoutes(window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1200);
    const onResize = () => fitRoutes(0);
    map.on("resize", onResize);
    for (const { route, index } of routes) {
      const id = `migration-route-${index}`;
      map.addSource(id, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: route.positions },
        },
      });
      map.addLayer({
        id,
        type: "line",
        source: id,
        paint: { "line-color": route.color, "line-width": 3, "line-opacity": 0.9 },
      });
      const bird = document.createElement("div");
      bird.className = "migration-bird";
      bird.style.setProperty("--route-color", route.color);
      bird.setAttribute("aria-hidden", "true");
      const image = document.createElement("img");
      image.src = mapSlots.find((slot) => slot.id === route.id)?.cutoutUrl ?? "";
      image.alt = "";
      bird.append(image);
      migrationMarkers.current.set(index, new Marker({ element: bird, anchor: "center", opacityWhenCovered: 0 })
        .setLngLat(positionAt(route.positions, migrationProgress.current))
        .addTo(map));
    }
    return () => {
      map.off("resize", onResize);
      for (const { index } of routes) {
        migrationMarkers.current.get(index)?.remove();
        if (mapRef.current === map) {
          map.removeLayer(`migration-route-${index}`);
          map.removeSource(`migration-route-${index}`);
        }
      }
      migrationMarkers.current.clear();
    };
  }, [activeMigration, mapReady, mapSlots]);

  useEffect(() => {
    if (focusBird === null) {
      mapRef.current?.stop();
      return;
    }
    const target = birdMarkers.current.get(focusBird.id);
    const map = mapRef.current;
    if (!target || !map) return;
    migrationActive.current = false;
    setActiveMigration(null);
    map.stop();
    const showCard = () => target.button.click();
    map.once("moveend", showCard);
    map.flyTo({
      center: target.coordinates,
      zoom: Math.max(map.getZoom(), 7),
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1200,
    });
    return () => {
      map.off("moveend", showCard);
    };
  }, [focusBird, mapSlots]);

  return (
    <section className={`bird-map${activeMigration !== null ? " migration-active" : ""}`} aria-label="Map of birds">
      <div className="globe" ref={mapContainer} />
      {unsupported && (
        <p className="map-message" role="status">
          Your browser cannot display the globe. Try another browser.
        </p>
      )}
      {selected &&
        createPortal(
          <BirdCard
            bird={selected.bird}
            onClose={() => selected.popup.remove()}
          />,
          selected.container,
        )}
      <MapToolbar
        recordings={recordings}
        migration={activeMigration}
        panelContainer={migrationPanel}
        onProgress={moveMigrationMarkers}
        onMigrationSelect={(selection) => {
          migrationActive.current = selection !== null;
          setActiveMigration(selection);
          if (selection === null) {
            mapRef.current?.flyTo({ center: homeCenter.current, zoom: osloZoom });
          } else {
            selected?.popup.remove();
          }
        }}
        onLocate={() => {
          migrationActive.current = false;
          setActiveMigration(null);
          mapRef.current?.flyTo({ center: homeCenter.current, zoom: osloZoom });
        }}
        initialQuery={initialQuery}
        initialResult={initialResult}
        onFocusBird={(id) => setFocusBird(id === null ? null : { id })}
      />
      <div className="migration-panel-slot" ref={setMigrationPanel} />
    </section>
  );
}
