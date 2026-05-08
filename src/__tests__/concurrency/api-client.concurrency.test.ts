/**
 * @jest-environment node
 */
import { api } from "@/lib/api-client";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe("[concurrency] api-client", () => {
  it("resolves 50 concurrent GET requests correctly", async () => {
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      callCount++;
      await new Promise((r) => setTimeout(r, Math.random() * 10));
      return new Response(JSON.stringify({ id: callCount, url }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const requests = Array.from({ length: 50 }, (_, i) =>
      api.get<{ id: number; url: string }>(`/api/items/${i}`),
    );

    const results = await Promise.all(requests);

    expect(results).toHaveLength(50);
    for (const result of results) {
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("url");
    }
    expect(global.fetch).toHaveBeenCalledTimes(50);
  });

  it("propagates errors correctly under concurrent failures", async () => {
    global.fetch = jest.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      await new Promise((r) => setTimeout(r, Math.random() * 5));
      const body = init?.body ? JSON.parse(init.body as string) : {};
      if (body.shouldFail) {
        return new Response("Server Error", { status: 500 });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const requests = Array.from({ length: 20 }, (_, i) =>
      api
        .post<{ ok: boolean }>(`/api/test/${i}`, { shouldFail: i % 3 === 0 })
        .then((r) => ({ status: "fulfilled", value: r }))
        .catch((e) => ({ status: "rejected", reason: e })),
    );

    const results = await Promise.all(requests);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled.length).toBeGreaterThan(0);
    expect(rejected.length).toBeGreaterThan(0);
    expect(fulfilled.length + rejected.length).toBe(20);
  });

  it("handles mixed methods concurrently", async () => {
    global.fetch = jest.fn().mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, Math.random() * 5));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });

    const requests = [
      api.get("/api/a"),
      api.post("/api/b", { data: 1 }),
      api.put("/api/c", { data: 2 }),
      api.del("/api/d"),
      api.get("/api/e"),
      api.post("/api/f", { data: 3 }),
    ];

    const results = await Promise.all(requests);
    expect(results).toHaveLength(6);
    expect(global.fetch).toHaveBeenCalledTimes(6);
  });
});
