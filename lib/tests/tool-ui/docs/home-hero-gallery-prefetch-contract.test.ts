import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("home hero gallery prefetch contract", () => {
  test("prefetches docs route via router API instead of importing route modules", () => {
    const filePath = path.join(process.cwd(), "app/components/home/home-hero.tsx");
    const content = fs.readFileSync(filePath, "utf8");

    expect(content).toContain('router.prefetch("/docs/gallery")');
    expect(content).not.toContain('import("@/app/docs/gallery/page")');
  });
});
