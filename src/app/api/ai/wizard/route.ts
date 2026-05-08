import { NextResponse, type NextRequest } from "next/server";
import type { WizardInput } from "@/types";
import { generateContent, buildWizardPrompt } from "@/lib/gemini";
import { MOCK_ITINERARY, MOCK_BUDGET } from "@/data/mock-itinerary";

export const runtime = "edge";

/**
 * POST /api/ai/wizard
 *
 * Generates a complete itinerary from wizard inputs using Gemini API.
 * Falls back to mock data when API key is missing or on parse failure.
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
  const result = await generateContent(prompt);

  if (!result) {
    return NextResponse.json({
      itinerary: MOCK_ITINERARY,
      budget: MOCK_BUDGET,
      _mock: true,
    });
  }

  const text = result.response.text();

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
