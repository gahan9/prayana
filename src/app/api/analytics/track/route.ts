import { NextResponse, type NextRequest } from "next/server";
import { BigQuery } from "@google-cloud/bigquery";

const bq = new BigQuery();
const datasetId = "analytics";
const tableId = "events";

export const runtime = "nodejs";

/**
 * POST /api/analytics/track
 * 
 * Server-side endpoint to pipe frontend events directly into BigQuery.
 * Ensures data persistency even if client-side analytics are blocked.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const row = {
      event_name: body.name,
      params: JSON.stringify(body.params),
      timestamp: body.timestamp || new Date().toISOString(),
    };

    // Insert into BigQuery
    await bq.dataset(datasetId).table(tableId).insert([row]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("BigQuery tracking error:", error);
    // Return 200 anyway to prevent client-side disruption
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
