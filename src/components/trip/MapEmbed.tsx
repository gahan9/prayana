"use client";

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface MapEmbedProps {
  query: string;
  className?: string;
}

const MAP_ID = "DEMO_MAP_ID"; // Replace with your Map ID in production for custom styling

/**
 * Premium Google Maps JavaScript API implementation.
 * Provides interactive markers and a curated modern theme.
 * Falls back to a clean placeholder if API key is missing.
 */
export function MapEmbed({ query, className = "" }: MapEmbedProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_MAPS_EMBED_API_KEY;

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    const loader = new Loader({
      apiKey,
      version: "weekly",
    });

    (async () => {
      try {
        const { Map } = (await loader.importLibrary("maps")) as google.maps.MapsLibrary;
        const { Geocoder } = (await loader.importLibrary("geocoding")) as google.maps.GeocodingLibrary;
        const { AdvancedMarkerElement } = (await loader.importLibrary("marker")) as google.maps.MarkerLibrary;

        if (!mapRef.current) return;

        const geocoder = new Geocoder();
        
        geocoder.geocode({ address: query }, (results, status) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            const map = new Map(mapRef.current!, {
              center: results[0].geometry.location,
              zoom: 12,
              mapId: MAP_ID,
              disableDefaultUI: true,
              zoomControl: true,
            });

            new AdvancedMarkerElement({
              map,
              position: results[0].geometry.location,
              title: query,
            });
          }
        });
      } catch (error) {
        console.error("Maps load error:", error);
      }
    })();
  }, [apiKey, query]);

  if (!apiKey) {
    return (
      <div
        className={`rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm ${className}`}
        style={{ minHeight: 300 }}
      >
        Map preview unavailable (API key not configured)
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`rounded-xl border-0 w-full overflow-hidden ${className}`}
      style={{ minHeight: 300 }}
      title={`Map of ${query}`}
    />
  );
}
