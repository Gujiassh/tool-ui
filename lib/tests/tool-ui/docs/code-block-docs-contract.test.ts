import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, test } from "vitest";

function getProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), "../../../..");
}

describe("code-block docs contract", () => {
  test("documents collapse as an explicit maxCollapsedLines option", () => {
    const content = readFileSync(
      path.join(getProjectRoot(), "app/docs/code-block/content.mdx"),
      "utf8",
    );

    expect(content).toContain("maxCollapsedLines");
    expect(content).not.toContain("long snippets auto-collapse");
  });

  test("uses CodeBlock.Standard consistently in usage snippets", () => {
    const docsContent = readFileSync(
      path.join(getProjectRoot(), "app/docs/code-block/content.mdx"),
      "utf8",
    );
    const presetExampleContent = readFileSync(
      path.join(getProjectRoot(), "app/docs/_components/preset-example.tsx"),
      "utf8",
    );

    expect(docsContent).toContain("<CodeBlock.Standard");
    expect(docsContent).not.toContain("<CodeBlock.Root");

    expect(presetExampleContent).toContain("return `<CodeBlock.Standard");
    expect(presetExampleContent).not.toContain("return `<CodeBlock.Root");
  });
});
