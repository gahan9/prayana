import { GoogleGenerativeAI, type GenerateContentResult } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && typeof window === "undefined") {
  console.warn("GEMINI_API_KEY is not set. AI features will return mock data.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const TRAVEL_SYSTEM_PROMPT = `You are Prayana, an expert travel planner AI. You create detailed, budget-aware travel itineraries.

When generating itineraries, ALWAYS respond with valid JSON matching this schema:
{
  "itinerary": [
    {
      "day": number,
      "order": number,
      "title": "string",
      "description": "string (include crowd estimate: low/medium/high)",
      "locationName": "string",
      "category": "transport" | "accommodation" | "food" | "activity" | "sightseeing" | "shopping" | "other",
      "duration": number (minutes),
      "cost": number (in the user's currency)
    }
  ],
  "budget": {
    "totalBudget": number,
    "currency": "string",
    "categories": {
      "accommodation": { "planned": number, "actual": 0 },
      "food": { "planned": number, "actual": 0 },
      "transport": { "planned": number, "actual": 0 },
      "activities": { "planned": number, "actual": 0 },
      "shopping": { "planned": number, "actual": 0 },
      "contingency": { "planned": number, "actual": 0 }
    },
    "dailyAverage": number
  },
  "recommendations": {
    "mustTryFood": ["string"],
    "culturalExperience": ["string"],
    "thrillActivities": ["string"],
    "shopping": ["string"],
    "souvenirs": ["string"],
    "memorySpots": ["string"],
    "hiddenGems": ["string"]
  }
}

Rules:
- Respect the user's budget strictly when flexibility is "strict", allow 10% overflow for "moderate", 25% for "flexible".
- Include crowd level estimates (low/medium/high) in each item description.
- Recommend must-try food, cultural experiences, thrill activities, shopping, souvenirs, and memory-making spots.
- Optimise day ordering to minimise travel time between locations.
- Be specific with location names and cost estimates in local currency.`;

export function getModel() {
  if (!genAI) return null;
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: TRAVEL_SYSTEM_PROMPT,
  });
}

export function buildWizardPrompt(input: {
  destinations: string[];
  dateRange: { start: string; end: string };
  budget: { amount: number; currency: string; flexibility: string };
  travelers: number;
  interests: string[];
  transportPreference: string[];
}): string {
  const days = Math.max(
    1,
    Math.ceil(
      (new Date(input.dateRange.end).getTime() -
        new Date(input.dateRange.start).getTime()) /
        86400000,
    ) + 1,
  );

  return `Plan a ${days}-day trip to ${input.destinations.join(", ")} for ${input.travelers} travelers.

Budget: ${input.budget.amount} ${input.budget.currency} (flexibility: ${input.budget.flexibility})
Dates: ${input.dateRange.start} to ${input.dateRange.end}
Interests: ${input.interests.join(", ")}
Transport preference: ${input.transportPreference.join(", ")}

Respond ONLY with the JSON schema specified. No markdown, no explanation, just valid JSON.`;
}

export async function generateContent(prompt: string): Promise<GenerateContentResult | null> {
  const model = getModel();
  if (!model) return null;
  return model.generateContent(prompt);
}

export { TRAVEL_SYSTEM_PROMPT };
