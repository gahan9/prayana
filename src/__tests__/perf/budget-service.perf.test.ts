import {
  allocateBudget,
  calculateActualSpend,
  convertCurrency,
} from "@/services/budget-service";

describe("[perf] budget-service", () => {
  it("allocateBudget x10,000 completes under 100ms", () => {
    const start = performance.now();
    for (let i = 0; i < 10_000; i++) {
      allocateBudget(15000 + i, "INR", 5);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  it("calculateActualSpend with 1,000 items completes under 50ms", () => {
    const items = Array.from({ length: 1000 }, (_, i) => ({
      category: (["food", "transport", "shopping", "accommodation"] as const)[i % 4],
      cost: Math.random() * 1000,
    }));

    const start = performance.now();
    calculateActualSpend(items);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
  });

  it("convertCurrency x100,000 completes under 200ms", () => {
    const pairs = [
      ["INR", "USD"],
      ["USD", "EUR"],
      ["EUR", "INR"],
      ["GBP", "INR"],
    ] as const;

    const start = performance.now();
    for (let i = 0; i < 100_000; i++) {
      const [from, to] = pairs[i % pairs.length];
      convertCurrency(i, from, to);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  });

  it("allocateBudget returns consistent results across runs", () => {
    const results = [];
    for (let i = 0; i < 100; i++) {
      results.push(allocateBudget(10000, "INR", 5));
    }
    const first = results[0];
    for (const r of results) {
      expect(r.categories.accommodation.planned).toBe(first.categories.accommodation.planned);
      expect(r.dailyAverage).toBe(first.dailyAverage);
    }
  });
});
