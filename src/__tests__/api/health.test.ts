/**
 * @jest-environment node
 */
import { GET } from "@/app/api/health/route";

function makeRequest(method = "GET"): Request {
  return new Request("http://localhost:3000/api/health", { method });
}

describe("/api/health", () => {
  it("returns 200 with JSON body", async () => {
    const res = await GET(makeRequest() as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("status", "ok");
  });

  it("includes required fields in response", async () => {
    const res = await GET(makeRequest() as never);
    const body = await res.json();
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("version");
    expect(body).toHaveProperty("services");
    expect(body.services).toHaveProperty("firestore");
    expect(body.services).toHaveProperty("auth");
    expect(body.services).toHaveProperty("storage");
  });

  it("returns valid ISO timestamp", async () => {
    const res = await GET(makeRequest() as never);
    const body = await res.json();
    const date = new Date(body.timestamp);
    expect(date.toISOString()).toBe(body.timestamp);
  });

  it("sets no-cache headers", async () => {
    const res = await GET(makeRequest() as never);
    const cacheControl = res.headers.get("Cache-Control");
    expect(cacheControl).toContain("no-store");
    expect(cacheControl).toContain("no-cache");
    expect(cacheControl).toContain("must-revalidate");
  });
});
