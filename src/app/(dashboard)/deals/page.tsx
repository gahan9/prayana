"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import dealsData from "@/data/deals.json";
import type { Deal, DealCategory } from "@/types";

const CATEGORY_LABELS: Record<DealCategory, string> = {
  flight: "Flights & Trains",
  hotel: "Hotels",
  package: "Packages",
  activity: "Activities",
  bank_offer: "Bank Offers",
};

const deals = dealsData as Deal[];

export default function DealsPage() {
  const [filter, setFilter] = useState<DealCategory | "all">("all");

  const filtered = filter === "all" ? deals : deals.filter((d) => d.category === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Deals & Offers</h1>
        <p className="text-gray-500 mb-8">
          Curated travel deals and bank offers to save on your next trip.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-brand-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          {(Object.entries(CATEGORY_LABELS) as [DealCategory, string][]).map(
            ([cat, label]) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filter === cat
                    ? "bg-brand-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ),
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((deal) => (
            <Card key={deal.id} className="flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block rounded-full bg-brand-100 text-brand-700 px-2 py-0.5 text-xs font-medium">
                  {CATEGORY_LABELS[deal.category] ?? deal.category}
                </span>
                {deal.discountPercent && (
                  <span className="text-sm font-bold text-green-600">
                    {deal.discountPercent}% off
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{deal.title}</h3>
              <p className="text-sm text-gray-500 flex-1">{deal.description}</p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  {deal.discountedPrice != null ? (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {deal.currency} {deal.discountedPrice.toLocaleString()}
                      </span>
                      {deal.originalPrice != null && (
                        <span className="text-sm text-gray-400 line-through">
                          {deal.currency} {deal.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">{deal.provider}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  Valid till {new Date(deal.validUntil).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
