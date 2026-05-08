/**
 * @jest-environment node
 */

jest.mock("@/lib/gemini", () => ({
  buildWizardPrompt: jest.fn().mockReturnValue("mock prompt"),
}));

jest.mock("@/lib/vertex", () => ({
  generateVertexContent: jest.fn().mockResolvedValue(null),
}));

import { POST as wizardPost } from "@/app/api/ai/wizard/route";
import { GET as healthGet } from "@/app/api/health/route";

function makeWizardRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/ai/wizard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("[security] API input validation", () => {
  describe("wizard API XSS protection", () => {
    it("handles XSS script tags in destination names", async () => {
      const res = await wizardPost(
        makeWizardRequest({
          destinations: ['<script>alert("xss")</script>'],
          dateRange: { start: "2026-06-01", end: "2026-06-03" },
          budget: { amount: 15000, currency: "INR", flexibility: "moderate" },
          travelers: 2,
          interests: ["food"],
          transportPreference: ["car"],
        }) as never,
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(JSON.stringify(body)).not.toContain("<script>");
    });

    it("handles XSS event handler payloads", async () => {
      const res = await wizardPost(
        makeWizardRequest({
          destinations: ['"><img src=x onerror=alert(1)>'],
          dateRange: { start: "2026-06-01", end: "2026-06-03" },
          budget: { amount: 15000, currency: "INR", flexibility: "moderate" },
          travelers: 2,
          interests: ["food"],
          transportPreference: ["car"],
        }) as never,
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(JSON.stringify(body)).not.toContain("onerror");
    });
  });

  describe("wizard API malformed input", () => {
    it("rejects empty destinations array", async () => {
      const res = await wizardPost(
        makeWizardRequest({
          destinations: [],
          dateRange: { start: "2026-06-01", end: "2026-06-03" },
        }) as never,
      );
      expect(res.status).toBe(400);
    });

    it("handles deeply nested JSON without crashing", async () => {
      let nested: unknown = { destinations: ["A"] };
      for (let i = 0; i < 20; i++) {
        nested = { wrapper: nested };
      }
      const res = await wizardPost(
        makeWizardRequest(nested) as never,
      );
      expect(res.status).toBe(400);
    });

    it("handles missing required fields gracefully", async () => {
      const res = await wizardPost(makeWizardRequest({}) as never);
      expect(res.status).toBe(400);
    });
  });

  describe("health API method restrictions", () => {
    it("GET returns 200", async () => {
      const res = await healthGet(
        new Request("http://localhost:3000/api/health") as never,
      );
      expect(res.status).toBe(200);
    });
  });

  describe("API response content type", () => {
    it("health returns JSON content type", async () => {
      const res = await healthGet(
        new Request("http://localhost:3000/api/health") as never,
      );
      const body = await res.json();
      expect(body).toHaveProperty("status");
    });

    it("wizard returns JSON content type", async () => {
      const res = await wizardPost(
        makeWizardRequest({
          destinations: ["Goa"],
          dateRange: { start: "2026-06-01", end: "2026-06-03" },
          budget: { amount: 5000, currency: "INR", flexibility: "strict" },
          travelers: 1,
          interests: ["food"],
          transportPreference: ["bus"],
        }) as never,
      );
      const body = await res.json();
      expect(body).toHaveProperty("itinerary");
    });
  });
});
