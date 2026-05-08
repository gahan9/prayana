jest.mock("@/lib/firebase", () => ({
  db: null,
  isConfigured: false,
}));

import { generateShortCode } from "@/lib/guest-session";

describe("[concurrency] guest-session", () => {
  it("generates 10,000 codes with zero collisions", async () => {
    const codes = await Promise.all(
      Array.from({ length: 10_000 }, () =>
        Promise.resolve(generateShortCode()),
      ),
    );
    const unique = new Set(codes);
    expect(unique.size).toBe(10_000);
  });

  it("generates codes concurrently without blocking", async () => {
    const start = performance.now();
    const batches = Array.from({ length: 50 }, () =>
      Promise.all(
        Array.from({ length: 200 }, () =>
          Promise.resolve(generateShortCode()),
        ),
      ),
    );
    const results = (await Promise.all(batches)).flat();
    const elapsed = performance.now() - start;

    expect(results).toHaveLength(10_000);
    expect(elapsed).toBeLessThan(5000);
  });

  it("all generated codes have valid length", async () => {
    const codes = await Promise.all(
      Array.from({ length: 1000 }, () =>
        Promise.resolve(generateShortCode(8)),
      ),
    );
    for (const code of codes) {
      expect(code).toHaveLength(8);
    }
  });
});
