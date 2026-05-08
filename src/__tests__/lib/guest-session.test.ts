jest.mock("@/lib/firebase", () => ({
  db: null,
  isConfigured: false,
}));

import { generateShortCode } from "@/lib/guest-session";

describe("guest-session", () => {
  describe("generateShortCode", () => {
    const VALID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

    it("generates a code of default length 6", () => {
      const code = generateShortCode();
      expect(code).toHaveLength(6);
    });

    it("generates a code of custom length", () => {
      expect(generateShortCode(10)).toHaveLength(10);
      expect(generateShortCode(3)).toHaveLength(3);
    });

    it("only uses allowed characters (no ambiguous chars)", () => {
      for (let i = 0; i < 100; i++) {
        const code = generateShortCode();
        for (const ch of code) {
          expect(VALID_CHARS).toContain(ch);
        }
      }
    });

    it("does not include ambiguous characters (0, O, l, I, 1, o)", () => {
      const ambiguous = "0OlI1o";
      for (let i = 0; i < 200; i++) {
        const code = generateShortCode();
        for (const ch of code) {
          expect(ambiguous).not.toContain(ch);
        }
      }
    });

    it("generates unique codes across 1000 calls", () => {
      const codes = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        codes.add(generateShortCode());
      }
      expect(codes.size).toBe(1000);
    });
  });
});
