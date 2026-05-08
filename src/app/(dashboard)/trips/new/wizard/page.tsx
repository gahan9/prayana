"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { WizardForm } from "@/components/wizard/WizardForm";
import { MOCK_ITINERARY, MOCK_BUDGET } from "@/data/mock-itinerary";
import type { WizardInput, ItineraryItem, BudgetBreakdown } from "@/types";

export default function WizardPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    itinerary: Partial<ItineraryItem>[];
    budget: BudgetBreakdown;
  } | null>(null);

  async function handleWizardSubmit(input: WizardInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        setResult({ itinerary: MOCK_ITINERARY, budget: MOCK_BUDGET });
        return;
      }

      const data = await res.json();
      setResult({
        itinerary: data.itinerary ?? MOCK_ITINERARY,
        budget: data.budget ?? MOCK_BUDGET,
      });
    } catch {
      setResult({ itinerary: MOCK_ITINERARY, budget: MOCK_BUDGET });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trip Wizard</h1>
        <p className="text-gray-500 mb-8">
          Tell us about your dream trip and we'll generate a personalised itinerary.
        </p>
        <Card>
          <WizardForm
            onSubmit={handleWizardSubmit}
            loading={loading}
            result={result}
          />
        </Card>
      </div>
    </div>
  );
}
