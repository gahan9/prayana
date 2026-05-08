import { NextResponse, type NextRequest } from "next/server";
import { translateTexts, detectLanguage, getSupportedLanguages } from "@/lib/translate";

export const runtime = "nodejs";

/**
 * POST /api/translate
 *
 * Translates text using Google Cloud Translation API v2.
 *
 * Request body:
 *   - texts: string[]          (required) – array of strings to translate
 *   - target: string           (required) – BCP-47 target language code
 *   - source?: string          (optional) – BCP-47 source language code (auto-detect if omitted)
 *
 * Response:
 *   - translations: TranslationResult[]
 */
export async function POST(req: NextRequest) {
  try {
    const { texts, target, source } = await req.json();

    if (!texts?.length || !target) {
      return NextResponse.json(
        { error: "Missing required fields: texts (string[]) and target (string)" },
        { status: 400 },
      );
    }

    const translations = await translateTexts(texts, target, source);
    return NextResponse.json({ translations });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    console.error("[Translate API]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/translate?action=languages&display=en
 * GET /api/translate?action=detect&q=hello
 *
 * Utility endpoints for language detection and listing supported languages.
 */
export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");

  try {
    if (action === "languages") {
      const display = req.nextUrl.searchParams.get("display") || "en";
      const languages = await getSupportedLanguages(display);
      return NextResponse.json({ languages });
    }

    if (action === "detect") {
      const q = req.nextUrl.searchParams.get("q");
      if (!q) {
        return NextResponse.json(
          { error: "Missing query parameter: q" },
          { status: 400 },
        );
      }
      const detections = await detectLanguage([q]);
      return NextResponse.json({ detections });
    }

    return NextResponse.json(
      { error: "Specify action=languages or action=detect" },
      { status: 400 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    console.error("[Translate API]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
