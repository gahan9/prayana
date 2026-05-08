"use client";

import { useState, useCallback } from "react";

interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

interface SupportedLanguage {
  language: string;
  name: string;
}

interface UseTranslateReturn {
  /** Translate an array of texts to the target language. */
  translate: (texts: string[], target: string, source?: string) => Promise<TranslationResult[]>;
  /** Fetch supported languages (cached after first call). */
  getLanguages: (display?: string) => Promise<SupportedLanguage[]>;
  /** Detect language of a text string. */
  detect: (text: string) => Promise<{ language: string; confidence: number }>;
  /** Whether a translation request is in-flight. */
  loading: boolean;
  /** Last error message, if any. */
  error: string | null;
}

/**
 * React hook for the Prayana translation service.
 *
 * Usage:
 * ```tsx
 * const { translate, loading, error } = useTranslate();
 * const results = await translate(["Hello world"], "hi");
 * // results[0].translatedText → "नमस्ते दुनिया"
 * ```
 */
export function useTranslate(): UseTranslateReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(
    async (texts: string[], target: string, source?: string): Promise<TranslationResult[]> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texts, target, source }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Translation failed");
        return data.translations;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Translation failed";
        setError(msg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getLanguages = useCallback(
    async (display: string = "en"): Promise<SupportedLanguage[]> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/translate?action=languages&display=${display}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch languages");
        return data.languages;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to fetch languages";
        setError(msg);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const detect = useCallback(
    async (text: string): Promise<{ language: string; confidence: number }> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/translate?action=detect&q=${encodeURIComponent(text)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Detection failed");
        return data.detections[0];
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Detection failed";
        setError(msg);
        return { language: "und", confidence: 0 };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { translate, getLanguages, detect, loading, error };
}
