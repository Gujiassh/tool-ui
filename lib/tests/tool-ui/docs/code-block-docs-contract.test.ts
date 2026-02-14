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
});
