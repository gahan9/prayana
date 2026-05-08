import { NextResponse, type NextRequest } from "next/server";
import type { WizardInput } from "@/types";
import { buildWizardPrompt } from "@/lib/gemini";
import { generateVertexContent } from "@/lib/vertex";
import { MOCK_ITINERARY, MOCK_BUDGET } from "@/data/mock-itinerary";

export const runtime = "nodejs";

/**
 * POST /api/ai/wizard
 *
 * Generates a complete itinerary from wizard inputs using Google Cloud Vertex AI.
 * Falls back to mock data when service is unavailable or on parse failure.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as WizardInput;

  if (!body.destinations?.length) {
    return NextResponse.json(
      { error: "At least one destination is required" },
      { status: 400 },
    );
  }

  const prompt = buildWizardPrompt(body);
  const result = await generateVertexContent(prompt);

  if (!result) {
    return NextResponse.json({
      itinerary: MOCK_ITINERARY,
      budget: MOCK_BUDGET,
      _mock: true,
    });
  }

  const response = await result.response;
  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      itinerary: parsed.itinerary ?? MOCK_ITINERARY,
      budget: parsed.budget ?? MOCK_BUDGET,
      recommendations: parsed.recommendations ?? null,
      _mock: false,
    });
  } catch {
    return NextResponse.json({
      itinerary: MOCK_ITINERARY,
      budget: MOCK_BUDGET,
      _raw: text,
      _mock: true,
    });
  }
}
