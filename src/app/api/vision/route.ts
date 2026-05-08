import { NextResponse, type NextRequest } from "next/server";
import { analyzeImage, analyzeImageUrl } from "@/lib/vision";
import type { VisionFeature } from "@/lib/vision";

export const runtime = "nodejs";

/**
 * POST /api/vision
 *
 * Analyses an image using Google Cloud Vision API.
 *
 * Request body (one of):
 *   - { imageBase64: string, features?: VisionFeature[] }
 *   - { imageUrl: string,    features?: VisionFeature[] }
 *
 * Response:
 *   - VisionAnalysisResult
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, imageUrl, features } = body as {
      imageBase64?: string;
      imageUrl?: string;
      features?: VisionFeature[];
    };

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json(
        { error: "Provide either imageBase64 or imageUrl" },
        { status: 400 },
      );
    }

    // Limit base64 payload to ~10 MB (after decoding)
    if (imageBase64 && imageBase64.length > 14_000_000) {
      return NextResponse.json(
        { error: "Image too large (max ~10 MB)" },
        { status: 413 },
      );
    }

    const result = imageBase64
      ? await analyzeImage(imageBase64, features)
      : await analyzeImageUrl(imageUrl!, features);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Vision analysis failed";
    console.error("[Vision API]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
