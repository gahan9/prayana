/**
 * @jest-environment node
 */

jest.mock("firebase/firestore", () => ({
  collection: jest.fn(() => ({ id: "mock-col" })),
  doc: jest.fn(() => ({ id: "mock-doc" })),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => "timestamp"),
}));

jest.mock("@/lib/gemini", () => ({
  buildWizardPrompt: jest.fn().mockReturnValue("mock prompt"),
}));

jest.mock("@/lib/vertex", () => ({
  generateVertexContent: jest.fn().mockResolvedValue(null),
}));

import { POST } from "@/app/api/ai/wizard/route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/ai/wizard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/ai/wizard", () => {
  it("returns 400 when destinations is empty", async () => {
    const res = await POST(makeRequest({ destinations: [] }) as never);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/destination/i);
  });

  it("returns 400 when destinations is missing", async () => {
    const res = await POST(makeRequest({}) as never);
    expect(res.status).toBe(400);
  });

  it("returns mock itinerary on valid request when Gemini unavailable", async () => {
    const input = {
      destinations: ["Jaipur"],
      dateRange: { start: "2026-06-01", end: "2026-06-03" },
      budget: { amount: 15000, currency: "INR", flexibility: "moderate" },
      travelers: 2,
      interests: ["food", "culture"],
      transportPreference: ["car"],
    };

    const res = await POST(makeRequest(input) as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("itinerary");
    expect(body).toHaveProperty("budget");
    expect(body._mock).toBe(true);
    expect(Array.isArray(body.itinerary)).toBe(true);
    expect(body.itinerary.length).toBeGreaterThan(0);
  });

  it("returns budget with all required categories", async () => {
    const input = {
      destinations: ["Goa"],
      dateRange: { start: "2026-07-01", end: "2026-07-05" },
      budget: { amount: 20000, currency: "INR", flexibility: "flexible" },
      travelers: 4,
      interests: ["food"],
      transportPreference: ["flight"],
    };

    const res = await POST(makeRequest(input) as never);
    const body = await res.json();
    const categories = Object.keys(body.budget.categories);
    expect(categories).toContain("accommodation");
    expect(categories).toContain("food");
    expect(categories).toContain("transport");
    expect(categories).toContain("activities");
    expect(categories).toContain("shopping");
    expect(categories).toContain("contingency");
  });
});
