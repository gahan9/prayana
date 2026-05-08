"use client";

import type { ItineraryItem, CrowdLevel } from "@/types";

interface TimelineProps {
  items: Partial<ItineraryItem>[];
  currency?: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  transport: "🚗",
  accommodation: "🏨",
  food: "🍽️",
  activity: "🎯",
  sightseeing: "📸",
  shopping: "🛍️",
  other: "📌",
};

function estimateCrowdLevel(description?: string): CrowdLevel | null {
  if (!description) return null;
  const lower = description.toLowerCase();
  if (lower.includes("crowd") || lower.includes("busy") || lower.includes("high")) return "high";
  if (lower.includes("moderate") || lower.includes("medium")) return "medium";
  if (lower.includes("quiet") || lower.includes("low") || lower.includes("uncrowded")) return "low";
  return null;
}

const CROWD_STYLES: Record<CrowdLevel, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export function Timeline({ items, currency = "INR" }: TimelineProps) {
  const grouped = new Map<number, Partial<ItineraryItem>[]>();
  for (const item of items) {
    const day = item.day ?? 1;
    if (!grouped.has(day)) grouped.set(day, []);
    grouped.get(day)!.push(item);
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries())
        .sort(([a], [b]) => a - b)
        .map(([day, dayItems]) => (
          <div key={day}>
            <h3 className="text-sm font-bold text-brand-600 uppercase tracking-wide mb-4">
              Day {day}
            </h3>
            <div className="relative pl-6 border-l-2 border-brand-200 space-y-4">
              {dayItems
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((item, idx) => {
                  const crowd = estimateCrowdLevel(item.description);
                  const icon = CATEGORY_ICONS[item.category ?? "other"] ?? "📌";
                  return (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[calc(0.75rem+1px)] top-1 w-4 h-4 rounded-full bg-brand-600 border-2 border-white" />
                      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base">{icon}</span>
                              <p className="font-medium text-gray-900 truncate">{item.title}</p>
                            </div>
                            {item.locationName && (
                              <p className="text-xs text-gray-400 mb-1.5">{item.locationName}</p>
                            )}
                            {item.description && (
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {item.duration && (
                                <span className="text-xs text-gray-400">
                                  {item.duration >= 60
                                    ? `${Math.floor(item.duration / 60)}h ${item.duration % 60 > 0 ? `${item.duration % 60}m` : ""}`
                                    : `${item.duration}m`}
                                </span>
                              )}
                              {crowd && (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CROWD_STYLES[crowd]}`}
                                >
                                  {crowd} crowd
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="inline-block rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium">
                              {item.category}
                            </span>
                            {item.cost != null && item.cost > 0 && (
                              <p className="text-xs text-gray-500 mt-1 font-medium">
                                {currency} {item.cost.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
    </div>
  );
}
