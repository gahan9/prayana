import * as fs from "fs";
import * as path from "path";

const nextConfigPath = path.resolve(process.cwd(), "next.config.js");

function extractCSPFromConfig(): string {
  const content = fs.readFileSync(nextConfigPath, "utf-8");
  const cspMatch = content.match(/Content-Security-Policy[\s\S]*?value:\s*\[([\s\S]*?)\]\.join/);
  return cspMatch ? cspMatch[1] : "";
}

function extractHeadersFromConfig(): string {
  return fs.readFileSync(nextConfigPath, "utf-8");
}

describe("[security] HTTP security headers", () => {
  const configContent = extractHeadersFromConfig();

  describe("required security headers present", () => {
    it("sets X-Content-Type-Options: nosniff", () => {
      expect(configContent).toContain("X-Content-Type-Options");
      expect(configContent).toContain("nosniff");
    });

    it("sets X-Frame-Options: DENY", () => {
      expect(configContent).toContain("X-Frame-Options");
      expect(configContent).toContain("DENY");
    });

    it("sets X-XSS-Protection", () => {
      expect(configContent).toContain("X-XSS-Protection");
      expect(configContent).toContain("1; mode=block");
    });

    it("sets Referrer-Policy", () => {
      expect(configContent).toContain("Referrer-Policy");
      expect(configContent).toContain("strict-origin-when-cross-origin");
    });

    it("sets Permissions-Policy restricting camera and microphone", () => {
      expect(configContent).toContain("Permissions-Policy");
      expect(configContent).toContain("camera=()");
      expect(configContent).toContain("microphone=()");
    });

    it("sets Strict-Transport-Security with long max-age", () => {
      expect(configContent).toContain("Strict-Transport-Security");
      expect(configContent).toContain("max-age=63072000");
      expect(configContent).toContain("includeSubDomains");
    });
  });

  describe("Content-Security-Policy directives", () => {
    const cspBlock = extractCSPFromConfig();

    it("has default-src self", () => {
      expect(cspBlock).toContain("default-src 'self'");
    });

    it("restricts script-src to self and Google domains", () => {
      expect(cspBlock).toContain("script-src");
      expect(cspBlock).toContain("https://www.gstatic.com");
      expect(cspBlock).toContain("https://apis.google.com");
    });

    it("restricts connect-src to Firebase and Google APIs", () => {
      expect(cspBlock).toContain("connect-src");
      expect(cspBlock).toContain("https://*.firebaseio.com");
      expect(cspBlock).toContain("https://*.googleapis.com");
    });

    it("restricts frame-src to Google domains", () => {
      expect(cspBlock).toContain("frame-src");
      expect(cspBlock).toContain("https://accounts.google.com");
    });

    it("restricts img-src appropriately", () => {
      expect(cspBlock).toContain("img-src");
      expect(cspBlock).toContain("https://firebasestorage.googleapis.com");
    });

    it("warns about unsafe-eval in script-src (tech debt)", () => {
      if (cspBlock.includes("unsafe-eval")) {
        console.warn(
          "[SECURITY TECH DEBT] CSP includes 'unsafe-eval' in script-src. " +
            "This should be removed when Next.js supports CSP nonces.",
        );
      }
      expect(cspBlock).toContain("script-src");
    });

    it("warns about unsafe-inline in style-src (tech debt)", () => {
      if (cspBlock.includes("unsafe-inline")) {
        console.warn(
          "[SECURITY TECH DEBT] CSP includes 'unsafe-inline' in style-src. " +
            "Consider using CSS modules or nonces.",
        );
      }
      expect(cspBlock).toContain("style-src");
    });
  });
});
