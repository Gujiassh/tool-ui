import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const DOCS_ROOT = path.resolve(process.cwd(), "app/docs");

function listContentMdxFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return listContentMdxFiles(fullPath);
    }
    return entry.isFile() && entry.name === "content.mdx" ? [fullPath] : [];
  });
}

describe("streaming docs audit", () => {
  it("uses safe parsers + shared render helper + shared state UI together", () => {
    const files = listContentMdxFiles(DOCS_ROOT);
    const toolkitFiles = files.filter((file) => {
      const content = fs.readFileSync(file, "utf8");
      return /const state = resolveStreamingToolRenderState/.test(content);
    });

    expect(toolkitFiles.length).toBeGreaterThan(0);

    for (const file of toolkitFiles) {
      const content = fs.readFileSync(file, "utf8");

      expect(
        content.includes("safeParseSerializable"),
        `${file} is missing safeParseSerializable* usage`,
      ).toBe(true);

      expect(
        content.includes('ToolRenderState'),
        `${file} is missing ToolRenderState usage`,
      ).toBe(true);

      expect(
        content.includes('from "@/components/tool-ui/shared";'),
        `${file} should import from shared helpers`,
      ).toBe(true);
    }
  });

  it("does not use raw state.message placeholders in toolkit snippets", () => {
    const files = listContentMdxFiles(DOCS_ROOT);
    const offenders = files.filter((file) => {
      const content = fs.readFileSync(file, "utf8");
      return /state\.message/.test(content) && /resolveStreamingToolRenderState/.test(content);
    });

    expect(offenders).toEqual([]);
  });
});
