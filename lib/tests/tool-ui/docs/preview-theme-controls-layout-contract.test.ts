import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("docs layout preview theme controls contract", () => {
  it("renders preview theme controls in the docs header", () => {
    const filePath = path.join(process.cwd(), "app/docs/layout.tsx");
    const content = fs.readFileSync(filePath, "utf8");

    expect(content).toContain("import { PreviewThemeControls }");
    expect(content).toContain("<PreviewThemeControls />");
  });
});
