import type { BudgetBreakdown, BudgetCategory, ItineraryItem } from "@/types";

const DEFAULT_ALLOCATION: Record<BudgetCategory, number> = {
  accommodation: 0.30,
  food: 0.20,
  transport: 0.15,
  activities: 0.20,
  shopping: 0.10,
  contingency: 0.05,
};

/**
 * Generates a budget breakdown from total budget and number of days.
 * Uses default allocation percentages.
 */
export function allocateBudget(
  totalBudget: number,
  currency: string,
  days: number,
): BudgetBreakdown {
  const categories = {} as BudgetBreakdown["categories"];
  for (const [cat, pct] of Object.entries(DEFAULT_ALLOCATION)) {
    categories[cat as BudgetCategory] = {
      planned: Math.round(totalBudget * pct),
      actual: 0,
    };
  }

  return {
    totalBudget,
    currency,
    categories,
    dailyAverage: Math.round(totalBudget / Math.max(days, 1)),
  };
}

/**
 * Sums actual costs from itinerary items per category.
 */
export function calculateActualSpend(
  items: Partial<ItineraryItem>[],
): Record<string, number> {
  const spend: Record<string, number> = {};
  for (const item of items) {
    const cat = item.category ?? "other";
    spend[cat] = (spend[cat] ?? 0) + (item.cost ?? 0);
  }
  return spend;
}

const EXCHANGE_RATES: Record<string, number> = {
  INR: 1,
  USD: 84.5,
  EUR: 92.0,
};

/**
 * Converts an amount between currencies using hardcoded rates.
 * POC only -- live conversion deferred to paid tier.
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
): number {
  const fromRate = EXCHANGE_RATES[from] ?? 1;
  const toRate = EXCHANGE_RATES[to] ?? 1;
  return Math.round((amount * fromRate) / toRate);
}
