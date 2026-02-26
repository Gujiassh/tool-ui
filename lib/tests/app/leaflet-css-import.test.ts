import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("root layout stylesheet imports", () => {
  test("imports Leaflet CSS directly so map tile/marker layout rules are always present", () => {
    const layoutPath = path.join(process.cwd(), "app/layout.tsx");
    const source = readFileSync(layoutPath, "utf8");

    expect(source).toContain('import "leaflet/dist/leaflet.css";');
  });
});
