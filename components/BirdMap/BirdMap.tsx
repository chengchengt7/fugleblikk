"use client";

import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import type { MultiPolygon } from "geojson";
import { Map as MapLibreMap, Marker, Popup, setWorkerUrl } from "maplibre-gl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import BirdCard from "@/components/BirdCard/BirdCard";
import { MAPTILER_SATELLITE_TILEJSON_ENDPOINT } from "@/constants/api";
import norwayLand from "@/data/norway-land.json";
import type { BirdMapSlot } from "@/lib/bird-map";
import type { BirdCardBird } from "@/types/bird";
import "./BirdMap.css";

const oslo: [number, number] = [10.75, 59.91];
const osloZoom = 5.8;
const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

export default function BirdMap({ slots }: { slots: BirdMapSlot[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const homeCenter = useRef<[number, number]>(oslo);
  const [unsupported, setUnsupported] = useState(false);
  const [selected, setSelected] = useState<{
    bird: BirdCardBird;
    container: HTMLDivElement;
    popup: Popup;
  } | null>(null);

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
    });

    let openPopup: Popup | null = null;
    const addMarker = (element: HTMLElement, coordinates: [number, number]) =>
      new Marker({ element, anchor: "center", opacityWhenCovered: 0 })
        .setLngLat(coordinates)
        .addTo(map);

    const markers = slots.map((slot) => {
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
    };
  }, [slots]);

  return (
    <section className="bird-map" aria-label="Map of birds">
      <div className="globe" ref={mapContainer} />
      {selected &&
        createPortal(
          <BirdCard
            bird={selected.bird}
            onClose={() => selected.popup.remove()}
          />,
          selected.container,
        )}
      <div className="attribution">
        <a
          className="bird-map-logo"
          href="https://www.maptiler.com"
          aria-label="Map imagery by MapTiler"
        >
          <Image
            src="/maptiler-logo.svg"
            alt="MapTiler"
            width={55}
            height={16}
          />
        </a>
        <a href="https://www.maptiler.com/copyright/">© MapTiler</a>
        <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>
      </div>
      <div className="controls">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Zoom in"
        >
          <img src="/icons/zoom-in.svg" alt="" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Zoom out"
        >
          <img src="/icons/zoom-out.svg" alt="" />
        </button>
        <button
          type="button"
          onClick={() =>
            mapRef.current?.flyTo({
              center: homeCenter.current,
              zoom: osloZoom,
            })
          }
          aria-label="Return to your location or Oslo"
        >
          <img src="/icons/near-me.svg" alt="" />
        </button>
      </div>
    </section>
  );
}
