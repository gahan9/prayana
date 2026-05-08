import type { WizardInput, ItineraryItem, BudgetBreakdown } from "@/types";

export interface WizardResult {
  itinerary: Partial<ItineraryItem>[];
  budget: BudgetBreakdown;
}

/**
 * Calls the wizard API endpoint and returns structured itinerary data.
 * Falls back gracefully on network or parse errors.
 */
export async function generateWizardPlan(input: WizardInput): Promise<WizardResult> {
  const res = await fetch("/api/ai/wizard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(`Wizard API error: ${res.status}`);
  }

  return res.json();
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Streams a chat response from the AI endpoint.
 * Returns a ReadableStream of text chunks.
 */
export async function streamChatMessage(
  messages: ChatMessage[],
  budget?: { amount: number; currency: string },
): Promise<ReadableStream<string>> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, budget }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Chat API error: ${res.status}`);
  }

  return res.body.pipeThrough(new TextDecoderStream());
}
