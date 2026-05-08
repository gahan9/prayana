"use client";

import { useState, useEffect, useCallback } from "react";
import { getUserTrips, createTrip, deleteTrip } from "@/services/trip-service";
import { useAuth } from "@/hooks/useAuth";
import type { Trip } from "@/types";

interface UseTripState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (data: Omit<Trip, "id" | "ownerId" | "createdAt">) => Promise<string | null>;
  remove: (tripId: string) => Promise<void>;
}

export function useTrip(): UseTripState {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setTrips([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getUserTrips(user.uid);
      setTrips(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trips");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (data: Omit<Trip, "id" | "ownerId" | "createdAt">): Promise<string | null> => {
      if (!user) return null;
      try {
        const id = await createTrip(user.uid, data);
        await refresh();
        return id;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create trip");
        return null;
      }
    },
    [user, refresh],
  );

  const remove = useCallback(
    async (tripId: string) => {
      try {
        await deleteTrip(tripId);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete trip");
      }
    },
    [refresh],
  );

  return { trips, loading, error, refresh, create, remove };
}
