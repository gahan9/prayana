import { type NextRequest } from "next/server";
import { getModel, TRAVEL_SYSTEM_PROMPT } from "@/lib/gemini";

export const runtime = "edge";

interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  budget?: { amount: number; currency: string };
}

/**
 * POST /api/ai/chat
 *
 * Streams Gemini responses as plain text for real-time chat UX.
 * Falls back to a static message when GEMINI_API_KEY is not configured.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatRequestBody;

  if (!body.messages?.length) {
    return new Response("Messages array is required", { status: 400 });
  }

  const model = getModel();

  if (!model) {
    const fallback =
      "I'm currently in demo mode. To get real travel recommendations, configure your Gemini API key. " +
      "Try the Trip Wizard for a mock itinerary preview!";
    return new Response(fallback, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const budgetContext = body.budget
    ? `\nUser's budget: ${body.budget.amount} ${body.budget.currency}. Factor this into all recommendations.\n`
    : "";

  const history = body.messages.slice(-10).map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));

  const lastMessage = history.pop();
  if (!lastMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: "System context: " + TRAVEL_SYSTEM_PROMPT + budgetContext }] },
      { role: "model", parts: [{ text: "Understood. I will act as Prayana, your expert travel planner." }] },
      ...history,
    ],
  });

  const result = await chat.sendMessageStream(lastMessage.parts[0].text);

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Transfer-Encoding": "chunked",
    },
  });
}
