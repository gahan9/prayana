/**
 * @jest-environment node
 */

jest.mock("@/lib/gemini", () => ({
  generateContent: jest.fn().mockResolvedValue(null),
  buildWizardPrompt: jest.fn().mockReturnValue("mock prompt"),
}));

import { GET } from "@/app/api/health/route";
import { POST } from "@/app/api/ai/wizard/route";

function makeHealthRequest(): Request {
  return new Request("http://localhost:3000/api/health", { method: "GET" });
}

function makeWizardRequest(): Request {
  return new Request("http://localhost:3000/api/ai/wizard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      destinations: ["Jaipur"],
      dateRange: { start: "2026-06-01", end: "2026-06-03" },
      budget: { amount: 15000, currency: "INR", flexibility: "moderate" },
      travelers: 2,
      interests: ["food"],
      transportPreference: ["car"],
    }),
  });
}

describe("[perf] API response times", () => {
  it("health endpoint responds under 50ms", async () => {
    const start = performance.now();
    const res = await GET(makeHealthRequest() as never);
    const elapsed = performance.now() - start;
    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(50);
  });

  it("wizard mock fallback responds under 200ms", async () => {
    const start = performance.now();
    const res = await POST(makeWizardRequest() as never);
    const elapsed = performance.now() - start;
    expect(res.status).toBe(200);
    expect(elapsed).toBeLessThan(200);
  });

  it("health endpoint sustains 100 sequential calls under 2s", async () => {
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      await GET(makeHealthRequest() as never);
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000);
  });
});
