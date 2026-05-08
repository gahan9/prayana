"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getTrip, getItinerary } from "@/services/trip-service";
import { allocateBudget } from "@/services/budget-service";
import { Timeline } from "@/components/trip/Timeline";
import { MapEmbed } from "@/components/trip/MapEmbed";
import { BudgetCard } from "@/components/budget/BudgetCard";
import { Button } from "@/components/ui/Button";
import { MOCK_ITINERARY, MOCK_BUDGET } from "@/data/mock-itinerary";
import type { Trip, ItineraryItem, BudgetBreakdown } from "@/types";

export default function TripDetailPage() {
  const params = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<Partial<ItineraryItem>[]>([]);
  const [budget, setBudget] = useState<BudgetBreakdown>(MOCK_BUDGET);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!params?.tripId) return;

      if (params?.tripId === "demo") {
        setItems(MOCK_ITINERARY);
        setBudget(MOCK_BUDGET);
        setLoading(false);
        return;
      }

      const t = await getTrip(params?.tripId as string);
      if (t) {
        setTrip(t);
        const itinerary = await getItinerary(params?.tripId as string);
        setItems(itinerary.length > 0 ? itinerary : MOCK_ITINERARY);

        const days = t.startDate && t.endDate
          ? Math.ceil((t.endDate.toMillis() - t.startDate.toMillis()) / 86400000) + 1
          : 3;
        setBudget(allocateBudget(t.budget ?? 15000, t.currency ?? "INR", days));
      } else {
        setItems(MOCK_ITINERARY);
      }
      setLoading(false);
    }
    load();
  }, [params?.tripId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading trip...</p>
      </div>
    );
  }

  const destination = trip?.destinations?.[0]
    ?? items[0]?.locationName
    ?? "Jaipur, Rajasthan";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/trips" className="text-sm text-brand-600 hover:underline mb-1 block">
              &larr; Back to trips
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {trip?.title ?? "Trip to " + destination}
            </h1>
            {trip?.description && (
              <p className="text-gray-500 mt-1">{trip.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href={`/trips/new/chat`}>
              <Button variant="secondary">Edit with Chat</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <MapEmbed query={destination} className="h-[300px]" />
            <Timeline items={items} currency={budget.currency} />
          </div>
          <div className="space-y-6">
            <BudgetCard budget={budget} />
          </div>
        </div>
      </div>
    </div>
  );
}
