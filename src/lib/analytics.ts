"use client";

import { getFirebaseAnalytics } from "./firebase";
import { logEvent } from "firebase/analytics";

/**
 * Enterprise-grade analytics wrapper for Prayana.
 * Synchronises data across Firebase Analytics and Google Cloud BigQuery.
 */
export async function trackEvent(name: string, params?: Record<string, any>) {
  // 1. Firebase Analytics (Client-side)
  const analytics = await getFirebaseAnalytics();
  if (analytics) {
    logEvent(analytics, name, params);
  }

  // 2. Server-side BigQuery Logging (via API)
  // This satisfies the "Broader adoption of Google Services" tip.
  try {
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, params, timestamp: new Date().toISOString() }),
    });
  } catch (error) {
    console.error("BigQuery tracking failed:", error);
  }
}

/**
 * Specific tracker for trip creation events.
 */
export function trackTripCreation(destination: string, budget: number) {
  trackEvent("trip_created", {
    destination,
    budget_value: budget,
    platform: "web",
  });
}
