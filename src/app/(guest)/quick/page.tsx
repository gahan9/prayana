"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGeolocation } from "@/hooks/useGeolocation";
import { saveGuestPlan } from "@/lib/guest-session";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MOCK_ITINERARY } from "@/data/mock-itinerary";
import type { ItineraryItem } from "@/types";

export default function QuickPage() {
  const { position, error: geoError, loading: geoLoading, requestPosition } = useGeolocation();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      let plan: Partial<ItineraryItem>[];

      if (position) {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `I'm at latitude ${position.latitude}, longitude ${position.longitude}. ` +
                  `Suggest a quick 4-hour exploration plan with food, sightseeing, and a hidden gem nearby. ` +
                  `List 5-6 specific places with estimated costs in INR.`,
              },
            ],
          }),
        });

        if (res.ok) {
          const text = await res.text();
          plan = [
            {
              day: 1,
              order: 1,
              title: "AI Quick Plan",
              description: text,
              category: "activity" as const,
            },
          ];
        } else {
          plan = MOCK_ITINERARY.slice(0, 3);
        }
      } else {
        plan = MOCK_ITINERARY.slice(0, 3);
      }

      const shortCode = await saveGuestPlan(
        plan,
        "Quick spontaneous trip",
        position ?? undefined,
      );
      router.push(`/g/${shortCode}`);
    } catch {
      setError("Failed to generate plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quick Trip</h1>
        <p className="text-gray-500 mb-8">
          Get instant recommendations based on your location. No sign-in required.
          Your plan expires in 3 days.
        </p>
        <Card className="text-center py-12 space-y-6">
          {!position ? (
            <>
              <div className="text-5xl">📍</div>
              <p className="text-gray-600">
                Share your location to get personalised nearby recommendations.
              </p>
              <Button onClick={requestPosition} disabled={geoLoading}>
                {geoLoading ? "Getting location..." : "Enable Location"}
              </Button>
              {geoError && (
                <p className="text-sm text-red-500">{geoError}</p>
              )}
            </>
          ) : (
            <>
              <div className="text-5xl">✅</div>
              <p className="text-gray-600">
                Location found: {position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}
              </p>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? "Generating plan..." : "Generate Quick Plan"}
              </Button>
            </>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </Card>
      </div>
    </div>
  );
}
