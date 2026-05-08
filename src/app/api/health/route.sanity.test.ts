/** @jest-environment node */

describe("backend api connector sanity", () => {
  it("returns a healthy connector payload", async () => {
    const { GET } = await import("./route");
    const response = await GET({} as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe("ok");
    expect(payload.services).toEqual({
      firestore: "ok",
      auth: "ok",
      storage: "ok",
    });
  });
});
