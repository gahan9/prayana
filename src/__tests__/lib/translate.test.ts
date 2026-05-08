/**
 * @jest-environment node
 */

// Mock global fetch before importing modules
const mockFetch = jest.fn();
global.fetch = mockFetch;

import { translateTexts, detectLanguage, getSupportedLanguages } from "@/lib/translate";

describe("translate library", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...ORIGINAL_ENV, GEMINI_API_KEY: "test-api-key" };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  // ── translateTexts ────────────────────────────────────────────────────────

  describe("translateTexts", () => {
    it("translates an array of texts to the target language", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            translations: [
              { translatedText: "Bonjour", detectedSourceLanguage: "en" },
              { translatedText: "Au revoir", detectedSourceLanguage: "en" },
            ],
          },
        }),
      });

      const result = await translateTexts(["Hello", "Goodbye"], "fr");

      expect(result).toHaveLength(2);
      expect(result[0].translatedText).toBe("Bonjour");
      expect(result[1].translatedText).toBe("Au revoir");
      expect(result[0].detectedSourceLanguage).toBe("en");
    });

    it("includes source language when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { translations: [{ translatedText: "Hola" }] },
        }),
      });

      await translateTexts(["Hello"], "es", "en");

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.source).toBe("en");
      expect(body.target).toBe("es");
    });

    it("throws when API key is missing", async () => {
      delete process.env.GEMINI_API_KEY;
      await expect(translateTexts(["test"], "fr")).rejects.toThrow(
        /API key is not configured/,
      );
    });

    it("throws on API error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => "Forbidden",
      });

      await expect(translateTexts(["test"], "fr")).rejects.toThrow(
        /Translation API error \(403\)/,
      );
    });
  });

  // ── detectLanguage ────────────────────────────────────────────────────────

  describe("detectLanguage", () => {
    it("detects the language of input texts", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            detections: [[{ language: "fr", confidence: 0.95 }]],
          },
        }),
      });

      const result = await detectLanguage(["Bonjour le monde"]);

      expect(result).toHaveLength(1);
      expect(result[0].language).toBe("fr");
      expect(result[0].confidence).toBe(0.95);
    });

    it("throws when API key is missing", async () => {
      delete process.env.GEMINI_API_KEY;
      await expect(detectLanguage(["test"])).rejects.toThrow(
        /API key is not configured/,
      );
    });

    it("throws on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      await expect(detectLanguage(["test"])).rejects.toThrow(
        /Language detection error \(500\)/,
      );
    });
  });

  // ── getSupportedLanguages ─────────────────────────────────────────────────

  describe("getSupportedLanguages", () => {
    it("returns a list of supported languages", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            languages: [
              { language: "en", name: "English" },
              { language: "hi", name: "Hindi" },
              { language: "es", name: "Spanish" },
            ],
          },
        }),
      });

      const result = await getSupportedLanguages("en");

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ language: "en", name: "English" });
      expect(result[1]).toEqual({ language: "hi", name: "Hindi" });
    });

    it("defaults to English display language", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { languages: [] } }),
      });

      await getSupportedLanguages();

      expect(mockFetch.mock.calls[0][0]).toContain("target=en");
    });

    it("throws on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => "Rate limited",
      });

      await expect(getSupportedLanguages()).rejects.toThrow(
        /Supported languages error \(429\)/,
      );
    });
  });
});
