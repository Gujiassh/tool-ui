import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("root layout mobile nav gate contract", () => {
  test("routes global nav through the lightweight gate component", () => {
    const rootLayoutPath = path.join(process.cwd(), "app/layout.tsx");
    const content = fs.readFileSync(rootLayoutPath, "utf8");

    expect(content).toContain(
      'from "@/app/components/layout/mobile-nav-sheet-gate.client"',
    );
    expect(content).not.toContain(
      'from "@/app/components/layout/mobile-nav-sheet.client"',
    );
  });
});
