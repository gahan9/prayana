import {
  allocateBudget,
  calculateActualSpend,
  convertCurrency,
} from "@/services/budget-service";

describe("budget-service", () => {
  describe("allocateBudget", () => {
    it("distributes budget according to default percentages", () => {
      const result = allocateBudget(10000, "INR", 5);
      expect(result.totalBudget).toBe(10000);
      expect(result.currency).toBe("INR");
      expect(result.categories.accommodation.planned).toBe(3000);
      expect(result.categories.food.planned).toBe(2000);
      expect(result.categories.transport.planned).toBe(1500);
      expect(result.categories.activities.planned).toBe(2000);
      expect(result.categories.shopping.planned).toBe(1000);
      expect(result.categories.contingency.planned).toBe(500);
    });

    it("sets all actual values to zero", () => {
      const result = allocateBudget(10000, "USD", 3);
      for (const cat of Object.values(result.categories)) {
        expect(cat.actual).toBe(0);
      }
    });

    it("calculates daily average correctly", () => {
      const result = allocateBudget(15000, "INR", 3);
      expect(result.dailyAverage).toBe(5000);
    });

    it("handles zero days by clamping to 1", () => {
      const result = allocateBudget(10000, "INR", 0);
      expect(result.dailyAverage).toBe(10000);
    });

    it("handles negative days by clamping to 1", () => {
      const result = allocateBudget(10000, "INR", -5);
      expect(result.dailyAverage).toBe(10000);
    });

    it("handles zero budget", () => {
      const result = allocateBudget(0, "INR", 5);
      expect(result.totalBudget).toBe(0);
      for (const cat of Object.values(result.categories)) {
        expect(cat.planned).toBe(0);
      }
    });

    it("rounds allocation to whole numbers", () => {
      const result = allocateBudget(1001, "USD", 3);
      for (const cat of Object.values(result.categories)) {
        expect(Number.isInteger(cat.planned)).toBe(true);
      }
    });
  });

  describe("calculateActualSpend", () => {
    it("returns empty object for empty items", () => {
      expect(calculateActualSpend([])).toEqual({});
    });

    it("sums costs by category", () => {
      const items = [
        { category: "food" as const, cost: 500 },
        { category: "food" as const, cost: 300 },
        { category: "transport" as const, cost: 200 },
      ];
      const result = calculateActualSpend(items);
      expect(result.food).toBe(800);
      expect(result.transport).toBe(200);
    });

    it("defaults missing category to 'other'", () => {
      const items = [{ cost: 100 }];
      const result = calculateActualSpend(items);
      expect(result.other).toBe(100);
    });

    it("treats missing cost as zero", () => {
      const items = [{ category: "food" as const }];
      const result = calculateActualSpend(items);
      expect(result.food).toBe(0);
    });

    it("handles mixed items with and without costs", () => {
      const items = [
        { category: "food" as const, cost: 500 },
        { category: "food" as const },
        { category: "shopping" as const, cost: 1000 },
      ];
      const result = calculateActualSpend(items);
      expect(result.food).toBe(500);
      expect(result.shopping).toBe(1000);
    });
  });

  describe("convertCurrency", () => {
    it("converts USD to INR", () => {
      const result = convertCurrency(100, "USD", "INR");
      expect(result).toBe(Math.round((100 * 84.5) / 1));
    });

    it("converts INR to EUR", () => {
      const result = convertCurrency(1000, "INR", "EUR");
      expect(result).toBe(Math.round((1000 * 1) / 92));
    });

    it("returns same amount for same currency", () => {
      expect(convertCurrency(500, "INR", "INR")).toBe(500);
    });

    it("falls back to rate 1 for unknown currencies", () => {
      const result = convertCurrency(100, "GBP", "INR");
      expect(result).toBe(Math.round((100 * 1) / 1));
    });

    it("handles zero amount", () => {
      expect(convertCurrency(0, "USD", "INR")).toBe(0);
    });
  });
});
