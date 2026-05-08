import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { HealthStatus } from "@/types";

export const runtime = "edge";

export async function GET(_req: NextRequest): Promise<NextResponse> {
  const status: HealthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "unknown",
    services: {
      firestore: "ok",
      auth: "ok",
      storage: "ok",
    },
  };

  return NextResponse.json(status, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
