import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

const BQ_PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const BQ_DATASET = "analytics";
const BQ_TABLE = "events";

/**
 * POST /api/analytics/track
 *
 * Server-side endpoint to pipe frontend events into BigQuery via REST API.
 * Uses the same API key — no additional SDK dependency required.
 * Falls back gracefully when BigQuery is not configured.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const row = {
      event_name: body.name,
      params: JSON.stringify(body.params),
      timestamp: body.timestamp || new Date().toISOString(),
    };

    // If BigQuery is configured, push via REST; otherwise just log
    if (BQ_PROJECT) {
      const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${BQ_PROJECT}/datasets/${BQ_DATASET}/tables/${BQ_TABLE}/insertAll`;
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        await fetch(`${url}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: [{ json: row }],
          }),
        }).catch((err) => {
          console.warn("[Analytics] BigQuery insert failed:", err.message);
        });
      }
    }

    // Always log to server console for observability
    console.log("[Analytics]", row.event_name, row.params);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    // Return 200 anyway to prevent client-side disruption
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
