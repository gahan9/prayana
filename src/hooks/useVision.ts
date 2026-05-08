"use client";

import { useState, useCallback } from "react";
import type { VisionAnalysisResult, VisionFeature } from "@/lib/vision";

interface UseVisionReturn {
  /** Analyse a base64-encoded image. */
  analyzeBase64: (base64: string, features?: VisionFeature[]) => Promise<VisionAnalysisResult | null>;
  /** Analyse an image from a public URL. */
  analyzeUrl: (url: string, features?: VisionFeature[]) => Promise<VisionAnalysisResult | null>;
  /** Analyse an image from a File object (e.g. from file input or drag-drop). */
  analyzeFile: (file: File, features?: VisionFeature[]) => Promise<VisionAnalysisResult | null>;
  /** Whether analysis is in-flight. */
  loading: boolean;
  /** Most recent analysis result. */
  result: VisionAnalysisResult | null;
  /** Last error message. */
  error: string | null;
}

/**
 * React hook for Google Cloud Vision API integration.
 *
 * Usage:
 * ```tsx
 * const { analyzeFile, result, loading } = useVision();
 *
 * const handleUpload = async (file: File) => {
 *   await analyzeFile(file);
 *   // result.landmarks, result.labels, result.text, etc.
 * };
 * ```
 */
export function useVision(): UseVisionReturn {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(
    async (body: Record<string, unknown>): Promise<VisionAnalysisResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Vision analysis failed");
        setResult(data);
        return data;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Vision analysis failed";
        setError(msg);
        setResult(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const analyzeBase64 = useCallback(
    (base64: string, features?: VisionFeature[]) =>
      callApi({ imageBase64: base64, features }),
    [callApi],
  );

  const analyzeUrl = useCallback(
    (url: string, features?: VisionFeature[]) =>
      callApi({ imageUrl: url, features }),
    [callApi],
  );

  const analyzeFile = useCallback(
    async (file: File, features?: VisionFeature[]) => {
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((s, b) => s + String.fromCharCode(b), ""),
      );
      return callApi({ imageBase64: base64, features });
    },
    [callApi],
  );

  return { analyzeBase64, analyzeUrl, analyzeFile, loading, result, error };
}
