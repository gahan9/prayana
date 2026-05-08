/**
 * @jest-environment node
 */

jest.mock("@/lib/translate", () => ({
  translateTexts: jest.fn(),
  detectLanguage: jest.fn(),
  getSupportedLanguages: jest.fn(),
}));

import { POST, GET } from "@/app/api/translate/route";
import { translateTexts, detectLanguage, getSupportedLanguages } from "@/lib/translate";

function makePost(body: unknown): Request {
  return new Request("http://localhost:3000/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGet(params: string) {
  const url = new URL(`http://localhost:3000/api/translate?${params}`);
  return {
    nextUrl: url,
    url: url.toString(),
  } as unknown as Request;
}

describe("/api/translate", () => {
  beforeEach(() => jest.clearAllMocks());

  describe("POST", () => {
    it("returns 400 when texts is missing", async () => {
      const res = await POST(makePost({ target: "hi" }) as never);
      expect(res.status).toBe(400);
    });

    it("returns 400 when target is missing", async () => {
      const res = await POST(makePost({ texts: ["Hello"] }) as never);
      expect(res.status).toBe(400);
    });

    it("translates on valid request", async () => {
      (translateTexts as jest.Mock).mockResolvedValueOnce([{ translatedText: "नमस्ते" }]);
      const res = await POST(makePost({ texts: ["Hello"], target: "hi" }) as never);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.translations[0].translatedText).toBe("नमस्ते");
    });

    it("returns 500 on service error", async () => {
      (translateTexts as jest.Mock).mockRejectedValueOnce(new Error("fail"));
      const res = await POST(makePost({ texts: ["x"], target: "fr" }) as never);
      expect(res.status).toBe(500);
    });
  });

  describe("GET", () => {
    it("returns languages list", async () => {
      (getSupportedLanguages as jest.Mock).mockResolvedValueOnce([{ language: "en", name: "English" }]);
      const res = await GET(makeGet("action=languages") as never);
      expect(res.status).toBe(200);
    });

    it("detects language", async () => {
      (detectLanguage as jest.Mock).mockResolvedValueOnce([{ language: "fr", confidence: 0.9 }]);
      const res = await GET(makeGet("action=detect&q=Bonjour") as never);
      expect(res.status).toBe(200);
    });

    it("returns 400 for detect without q", async () => {
      const res = await GET(makeGet("action=detect") as never);
      expect(res.status).toBe(400);
    });

    it("returns 400 for no action", async () => {
      const res = await GET(makeGet("") as never);
      expect(res.status).toBe(400);
    });
  });
});
