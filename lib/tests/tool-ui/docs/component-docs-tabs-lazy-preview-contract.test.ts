import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("component docs tabs lazy preview contract", () => {
  test("loads preview panel lazily from component docs tabs", () => {
    const tabsPath = path.join(
      process.cwd(),
      "app/docs/_components/component-docs-tabs.tsx",
    );
    const content = fs.readFileSync(tabsPath, "utf8");

    expect(content).toContain('import("./component-preview")');
    expect(content).toContain('activeTab === "examples"');
    expect(content).toContain('loading: () => (');
    expect(content).toContain("Loading examples");
  });

  test("component doc pages avoid direct component preview imports", () => {
    const docsRoot = path.join(process.cwd(), "app/docs");
    const entries = fs.readdirSync(docsRoot, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const pagePath = path.join(docsRoot, entry.name, "page.tsx");
      if (!fs.existsSync(pagePath)) continue;

      const content = fs.readFileSync(pagePath, "utf8");
      if (!content.includes("ComponentDocsTabs")) continue;

      expect(content, pagePath).not.toContain("../_components/component-preview");
      expect(content, pagePath).toContain("componentId=");
    }
  });
});
