import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("docs nav preview-theme param preservation contract", () => {
  it("preserves all preview* params for examples navigation links", () => {
    const filePath = path.join(process.cwd(), "app/docs/_components/docs-nav.tsx");
    const content = fs.readFileSync(filePath, "utf8");

    expect(content).toContain("PREVIEW_THEME_QUERY_PARAM_KEYS");
    expect(content).toContain(
      "for (const paramKey of PREVIEW_THEME_QUERY_PARAM_KEYS)",
    );
    expect(content).toContain("params.set(paramKey, value)");
  });
});
