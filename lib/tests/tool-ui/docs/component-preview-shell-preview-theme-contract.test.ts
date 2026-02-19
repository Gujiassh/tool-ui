import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("component preview shell preview-theme contract", () => {
  it("applies scoped preview theme data attributes and CSS vars", () => {
    const filePath = path.join(
      process.cwd(),
      "app/docs/_components/component-preview-shell.tsx",
    );
    const content = fs.readFileSync(filePath, "utf8");

    expect(content).toContain("useResolvedPreviewTheme");
    expect(content).toContain("data-theme={resolvedAppearance}");
    expect(content).toContain("style={previewThemeShellStyle}");
  });

  it("switches shell background classes using resolved preview appearance", () => {
    const filePath = path.join(
      process.cwd(),
      "app/docs/_components/component-preview-shell.tsx",
    );
    const content = fs.readFileSync(filePath, "utf8");

    expect(content).toContain("isDarkPreview ? \"bg-neutral-950\" : \"bg-neutral-100\"");
  });
});
