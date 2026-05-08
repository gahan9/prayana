/**
 * @jest-environment node
 */

const mockFetch = jest.fn();
global.fetch = mockFetch;

import { analyzeImage, analyzeImageUrl } from "@/lib/vision";

const MOCK_VISION_RESPONSE = {
  responses: [
    {
      landmarkAnnotations: [
        { description: "Eiffel Tower", score: 0.98, locations: [{ latLng: { latitude: 48.858, longitude: 2.294 } }] },
      ],
      labelAnnotations: [
        { description: "Tower", score: 0.95 },
        { description: "Landmark", score: 0.92 },
      ],
      textAnnotations: [{ description: "Tour Eiffel" }],
      fullTextAnnotation: { text: "Tour Eiffel", pages: [] },
      webDetection: {
        webEntities: [{ description: "Eiffel Tower", score: 0.9 }],
        bestGuessLabels: [{ label: "eiffel tower paris" }],
        pagesWithMatchingImages: [],
      },
      imagePropertiesAnnotation: {
        dominantColors: {
          colors: [
            { color: { red: 120, green: 100, blue: 80 }, score: 0.4 },
          ],
        },
      },
      safeSearchAnnotation: {
        adult: "VERY_UNLIKELY",
        violence: "VERY_UNLIKELY",
        racy: "VERY_UNLIKELY",
      },
    },
  ],
};

describe("vision library", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, GEMINI_API_KEY: "test-api-key" };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  // ── analyzeImage (base64) ─────────────────────────────────────────────────

  describe("analyzeImage", () => {
    it("returns structured results from a base64 image", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_VISION_RESPONSE,
      });

      const result = await analyzeImage("base64encodedimage");

      expect(result.landmarks).toHaveLength(1);
      expect(result.landmarks[0].description).toBe("Eiffel Tower");
      expect(result.landmarks[0].score).toBe(0.98);
      expect(result.landmarks[0].locations?.[0].latLng.latitude).toBeCloseTo(48.858);

      expect(result.labels).toHaveLength(2);
      expect(result.labels[0].description).toBe("Tower");

      expect(result.text).toBe("Tour Eiffel");

      expect(result.webDetection).not.toBeNull();
      expect(result.webDetection!.webEntities[0].description).toBe("Eiffel Tower");

      expect(result.dominantColors).toHaveLength(1);
      expect(result.safeSearch?.adult).toBe("VERY_UNLIKELY");
    });

    it("sends correct features in the API request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ responses: [{}] }),
      });

      await analyzeImage("img", ["LANDMARK_DETECTION", "LABEL_DETECTION"]);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.requests[0].features).toEqual([
        { type: "LANDMARK_DETECTION", maxResults: 10 },
        { type: "LABEL_DETECTION", maxResults: 10 },
      ]);
      expect(body.requests[0].image.content).toBe("img");
    });

    it("handles empty/missing annotation fields gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ responses: [{}] }),
      });

      const result = await analyzeImage("img");

      expect(result.landmarks).toEqual([]);
      expect(result.labels).toEqual([]);
      expect(result.text).toBeNull();
      expect(result.fullTextAnnotation).toBeNull();
      expect(result.webDetection).toBeNull();
      expect(result.dominantColors).toEqual([]);
      expect(result.safeSearch).toBeNull();
    });

    it("throws when API key is missing", async () => {
      delete process.env.GEMINI_API_KEY;
      await expect(analyzeImage("img")).rejects.toThrow(/API key is not configured/);
    });

    it("throws on API error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Bad Request",
      });

      await expect(analyzeImage("img")).rejects.toThrow(/Vision API error \(400\)/);
    });
  });

  // ── analyzeImageUrl ───────────────────────────────────────────────────────

  describe("analyzeImageUrl", () => {
    it("sends image URL source instead of base64 content", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_VISION_RESPONSE,
      });

      const result = await analyzeImageUrl("https://example.com/photo.jpg");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.requests[0].image.source.imageUri).toBe("https://example.com/photo.jpg");
      expect(body.requests[0].image.content).toBeUndefined();

      expect(result.landmarks).toHaveLength(1);
    });

    it("throws when API key is missing", async () => {
      delete process.env.GEMINI_API_KEY;
      await expect(analyzeImageUrl("https://example.com/img.jpg")).rejects.toThrow(
        /API key is not configured/,
      );
    });

    it("throws on API error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => "Forbidden",
      });

      await expect(analyzeImageUrl("https://example.com/img.jpg")).rejects.toThrow(
        /Vision API error \(403\)/,
      );
    });
  });
});
