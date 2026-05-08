/**
 * Google Cloud Vision API v1 — REST client for image analysis.
 *
 * Supports landmark detection, label detection, text extraction (OCR),
 * and safe-search annotations. Ideal for travel photo analysis and
 * document/ticket scanning.
 *
 * @see https://cloud.google.com/vision/docs/reference/rest/v1/images/annotate
 */

const VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate";

/** Types of analysis the Vision API can perform. */
export type VisionFeature =
  | "LANDMARK_DETECTION"
  | "LABEL_DETECTION"
  | "TEXT_DETECTION"
  | "DOCUMENT_TEXT_DETECTION"
  | "SAFE_SEARCH_DETECTION"
  | "IMAGE_PROPERTIES"
  | "WEB_DETECTION";

/** A single annotation entity returned by the API. */
export interface VisionAnnotation {
  description: string;
  score: number;
  locations?: Array<{
    latLng: { latitude: number; longitude: number };
  }>;
  boundingPoly?: {
    vertices: Array<{ x: number; y: number }>;
  };
}

/** Full text annotation for OCR results. */
export interface TextAnnotation {
  text: string;
  pages?: Array<{
    width: number;
    height: number;
    blocks: Array<{
      paragraphs: Array<{
        words: Array<{
          symbols: Array<{ text: string }>;
        }>;
      }>;
    }>;
  }>;
}

/** Web detection result for reverse image search. */
export interface WebDetection {
  webEntities: Array<{ description: string; score: number }>;
  bestGuessLabels: Array<{ label: string }>;
  pagesWithMatchingImages: Array<{ url: string; pageTitle: string }>;
}

/** Combined response from a Vision API analysis. */
export interface VisionAnalysisResult {
  landmarks: VisionAnnotation[];
  labels: VisionAnnotation[];
  text: string | null;
  fullTextAnnotation: TextAnnotation | null;
  webDetection: WebDetection | null;
  dominantColors: Array<{ color: { red: number; green: number; blue: number }; score: number }>;
  safeSearch: {
    adult: string;
    violence: string;
    racy: string;
  } | null;
}

/**
 * Analyses an image using the Google Cloud Vision API.
 *
 * @param imageBase64 - Base64-encoded image content (no data: prefix).
 * @param features    - Array of feature types to detect (defaults to a travel-optimised set).
 * @returns Structured analysis result.
 * @throws Error when API key is missing or the request fails.
 */
export async function analyzeImage(
  imageBase64: string,
  features: VisionFeature[] = [
    "LANDMARK_DETECTION",
    "LABEL_DETECTION",
    "TEXT_DETECTION",
    "WEB_DETECTION",
    "IMAGE_PROPERTIES",
    "SAFE_SEARCH_DETECTION",
  ],
): Promise<VisionAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Vision API key is not configured");
  }

  const requestFeatures = features.map((type) => ({ type, maxResults: 10 }));

  const res = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content: imageBase64 },
          features: requestFeatures,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vision API error (${res.status}): ${err}`);
  }

  const json = await res.json();
  const response = json.responses?.[0] || {};

  return {
    landmarks: (response.landmarkAnnotations || []).map(mapAnnotation),
    labels: (response.labelAnnotations || []).map(mapAnnotation),
    text: response.textAnnotations?.[0]?.description || null,
    fullTextAnnotation: response.fullTextAnnotation || null,
    webDetection: response.webDetection
      ? {
          webEntities: (response.webDetection.webEntities || []).map(
            (e: { description?: string; score?: number }) => ({
              description: e.description || "",
              score: e.score || 0,
            }),
          ),
          bestGuessLabels: response.webDetection.bestGuessLabels || [],
          pagesWithMatchingImages: response.webDetection.pagesWithMatchingImages || [],
        }
      : null,
    dominantColors: (
      response.imagePropertiesAnnotation?.dominantColors?.colors || []
    ).map((c: { color: { red: number; green: number; blue: number }; score: number }) => ({
      color: c.color,
      score: c.score,
    })),
    safeSearch: response.safeSearchAnnotation || null,
  };
}

/**
 * Analyses an image from a public URL.
 *
 * @param imageUrl - The public URL of the image.
 * @param features - Array of feature types to detect.
 * @returns Structured analysis result.
 */
export async function analyzeImageUrl(
  imageUrl: string,
  features: VisionFeature[] = ["LANDMARK_DETECTION", "LABEL_DETECTION", "WEB_DETECTION"],
): Promise<VisionAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Vision API key is not configured");
  }

  const requestFeatures = features.map((type) => ({ type, maxResults: 10 }));

  const res = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { source: { imageUri: imageUrl } },
          features: requestFeatures,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vision API error (${res.status}): ${err}`);
  }

  const json = await res.json();
  const response = json.responses?.[0] || {};

  // Reuse the same mapping logic
  return {
    landmarks: (response.landmarkAnnotations || []).map(mapAnnotation),
    labels: (response.labelAnnotations || []).map(mapAnnotation),
    text: response.textAnnotations?.[0]?.description || null,
    fullTextAnnotation: response.fullTextAnnotation || null,
    webDetection: response.webDetection
      ? {
          webEntities: (response.webDetection.webEntities || []).map(
            (e: { description?: string; score?: number }) => ({
              description: e.description || "",
              score: e.score || 0,
            }),
          ),
          bestGuessLabels: response.webDetection.bestGuessLabels || [],
          pagesWithMatchingImages: response.webDetection.pagesWithMatchingImages || [],
        }
      : null,
    dominantColors: (
      response.imagePropertiesAnnotation?.dominantColors?.colors || []
    ).map((c: { color: { red: number; green: number; blue: number }; score: number }) => ({
      color: c.color,
      score: c.score,
    })),
    safeSearch: response.safeSearchAnnotation || null,
  };
}

/** Maps a raw API annotation to the internal type. */
function mapAnnotation(raw: {
  description?: string;
  score?: number;
  locations?: Array<{ latLng: { latitude: number; longitude: number } }>;
  boundingPoly?: { vertices: Array<{ x: number; y: number }> };
}): VisionAnnotation {
  return {
    description: raw.description || "",
    score: raw.score || 0,
    locations: raw.locations,
    boundingPoly: raw.boundingPoly,
  };
}
