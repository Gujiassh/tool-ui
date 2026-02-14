import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const FILES_WITH_LOCAL_TABS = [
  "mdx-components.tsx",
  "app/docs/_components/preset-example.tsx",
  "app/docs/_components/header-preview-tabs.tsx",
] as const;

describe("fumadocs tabs compatibility contract", () => {
  test("uses local tabs compatibility module instead of fumadocs tabs component", () => {
    for (const file of FILES_WITH_LOCAL_TABS) {
      const absolutePath = path.join(process.cwd(), file);
      const content = fs.readFileSync(absolutePath, "utf8");

      expect(content, file).not.toContain("fumadocs-ui/components/tabs");
      expect(content, file).toContain("@/app/docs/_components/fumadocs-tabs");
    }
  });

  test("local compatibility module exports legacy and radix-style tab APIs", () => {
    const compatPath = path.join(
      process.cwd(),
      "app/docs/_components/fumadocs-tabs.tsx",
    );
    const content = fs.readFileSync(compatPath, "utf8");

    expect(content).toContain("export function Tabs");
    expect(content).toContain("export function Tab");
    expect(content).toContain("export { TabsList, TabsTrigger, TabsContent }");
  });
});
