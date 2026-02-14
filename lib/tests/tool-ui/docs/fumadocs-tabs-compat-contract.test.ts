import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const FILES_WITH_FUMADOCS_TABS = [
  "mdx-components.tsx",
  "app/docs/_components/preset-example.tsx",
  "app/docs/_components/header-preview-tabs.tsx",
] as const;

describe("fumadocs tabs contract", () => {
  test("uses fumadocs tabs component directly", () => {
    for (const file of FILES_WITH_FUMADOCS_TABS) {
      const absolutePath = path.join(process.cwd(), file);
      const content = fs.readFileSync(absolutePath, "utf8");

      expect(content, file).toContain("fumadocs-ui/components/tabs");
      expect(content, file).not.toContain("@/app/docs/_components/fumadocs-tabs");
    }
  });

  test("does not rely on a local fumadocs tabs compatibility module", () => {
    const compatPath = path.join(
      process.cwd(),
      "app/docs/_components/fumadocs-tabs.tsx",
    );

    expect(fs.existsSync(compatPath)).toBe(false);
  });
});
