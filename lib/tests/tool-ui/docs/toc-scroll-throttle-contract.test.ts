import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("docs toc scroll throttle contract", () => {
  test("throttles scroll-driven heading updates with requestAnimationFrame", () => {
    const observerPath = path.join(process.cwd(), "hooks/use-headings-observer.ts");
    const content = fs.readFileSync(observerPath, "utf8");

    expect(content).toContain("requestAnimationFrame");
  });
});
