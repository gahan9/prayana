/**
 * Google Cloud Translation API v2 — lightweight REST client.
 *
 * Uses the project's existing API key so no additional npm package is needed.
 * For production at scale, swap to the `@google-cloud/translate` SDK with
 * service-account auth for quota management and IAM control.
 *
 * @see https://cloud.google.com/translate/docs/reference/rest/v2/translations/translate
 */

const TRANSLATE_API_URL = "https://translation.googleapis.com/language/translate/v2";

/** Supported language metadata returned by the API. */
export interface SupportedLanguage {
  language: string;
  name: string;
}

/** A single translation result. */
export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

/**
 * Translates one or more strings from a source language to a target language.
 *
 * @param texts   - Array of strings to translate.
 * @param target  - BCP-47 target language code (e.g. "hi", "es", "fr").
 * @param source  - Optional BCP-47 source language code. Omit for auto-detect.
 * @returns Array of translation results.
 * @throws Error when API key is missing or the request fails.
 */
export async function translateTexts(
  texts: string[],
  target: string,
  source?: string,
): Promise<TranslationResult[]> {
  const apiKey = process.env.GEMINI_API_KEY; // same key, Translate API enabled on it

  if (!apiKey) {
    throw new Error("Translation API key is not configured");
  }

  const body: Record<string, unknown> = {
    q: texts,
    target,
    format: "text",
  };

  if (source) {
    body.source = source;
  }

  const res = await fetch(`${TRANSLATE_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Translation API error (${res.status}): ${err}`);
  }

  const json = await res.json();
  return json.data.translations as TranslationResult[];
}

/**
 * Detects the language of one or more strings.
 *
 * @param texts - Array of strings to detect.
 * @returns Array of detections with language code and confidence.
 */
export async function detectLanguage(
  texts: string[],
): Promise<Array<{ language: string; confidence: number }>> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Translation API key is not configured");
  }

  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: texts }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Language detection error (${res.status}): ${err}`);
  }

  const json = await res.json();
  // API returns detections[i][0] with the top detection for each input
  return json.data.detections.map(
    (d: Array<{ language: string; confidence: number }>) => d[0],
  );
}

/**
 * Fetches the list of languages supported by the Translation API.
 *
 * @param displayLanguage - Language code to localise the language names (default "en").
 * @returns Array of supported languages with localised names.
 */
export async function getSupportedLanguages(
  displayLanguage: string = "en",
): Promise<SupportedLanguage[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Translation API key is not configured");
  }

  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2/languages?key=${apiKey}&target=${displayLanguage}`,
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supported languages error (${res.status}): ${err}`);
  }

  const json = await res.json();
  return json.data.languages as SupportedLanguage[];
}
