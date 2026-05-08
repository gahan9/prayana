"use client";

import { useState, useCallback } from "react";
import type { GeoPoint } from "@/types";

interface GeolocationState {
  position: GeoPoint | null;
  error: string | null;
  loading: boolean;
  requestPosition: () => void;
}

export function useGeolocation(): GeolocationState {
  const [position, setPosition] = useState<GeoPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location permission denied. Please enable in browser settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location unavailable. Try again later.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out.");
            break;
          default:
            setError("An unknown error occurred.");
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  return { position, error, loading, requestPosition };
}
