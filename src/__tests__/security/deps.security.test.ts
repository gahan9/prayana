import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

describe("[security] dependency audit", () => {
  it("has no critical vulnerabilities", () => {
    let auditOutput: string;
    try {
      auditOutput = execSync("npm audit --json 2>&1", {
        cwd: process.cwd(),
        encoding: "utf-8",
        timeout: 30000,
      });
    } catch (err: unknown) {
      auditOutput = (err as { stdout?: string }).stdout ?? "{}";
    }

    const audit = JSON.parse(auditOutput || "{}");
    const critical = audit?.metadata?.vulnerabilities?.critical ?? 0;
    expect(critical).toBe(0);
  });

  it("has no high vulnerabilities (warning)", () => {
    let auditOutput: string;
    try {
      auditOutput = execSync("npm audit --json 2>&1", {
        cwd: process.cwd(),
        encoding: "utf-8",
        timeout: 30000,
      });
    } catch (err: unknown) {
      auditOutput = (err as { stdout?: string }).stdout ?? "{}";
    }

    const audit = JSON.parse(auditOutput || "{}");
    const high = audit?.metadata?.vulnerabilities?.high ?? 0;
    if (high > 0) {
      console.warn(
        `[SECURITY WARNING] ${high} high severity vulnerabilities found. Run 'npm audit' for details.`,
      );
    }
    expect(high).toBeLessThanOrEqual(10);
  });
});

describe("[security] source code patterns", () => {
  const srcDir = path.resolve(process.cwd(), "src");

  function getAllTsFiles(dir: string): string[] {
    const files: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "__tests__") {
        files.push(...getAllTsFiles(fullPath));
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
    return files;
  }

  it("does not use eval() in source code", () => {
    const files = getAllTsFiles(srcDir);
    const violations: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      if (/\beval\s*\(/.test(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    }

    expect(violations).toEqual([]);
  });

  it("does not use dangerouslySetInnerHTML in components", () => {
    const files = getAllTsFiles(srcDir);
    const violations: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      if (content.includes("dangerouslySetInnerHTML")) {
        violations.push(path.relative(process.cwd(), file));
      }
    }

    expect(violations).toEqual([]);
  });

  it("does not use innerHTML in components", () => {
    const files = getAllTsFiles(srcDir);
    const violations: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      if (/\.innerHTML\s*=/.test(content)) {
        violations.push(path.relative(process.cwd(), file));
      }
    }

    expect(violations).toEqual([]);
  });

  it("does not expose API keys in source files", () => {
    const files = getAllTsFiles(srcDir);
    const keyPatterns = [
      /AIza[0-9A-Za-z_-]{35}/,
      /sk-[a-zA-Z0-9]{20,}/,
      /ghp_[a-zA-Z0-9]{36}/,
    ];
    const violations: string[] = [];

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      for (const pattern of keyPatterns) {
        if (pattern.test(content)) {
          violations.push(path.relative(process.cwd(), file));
          break;
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
