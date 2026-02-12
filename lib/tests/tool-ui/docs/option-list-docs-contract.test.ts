import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("option-list docs contract", () => {
  test("uses choice prop terminology for receipt state", () => {
    const contentPath = path.resolve(
      process.cwd(),
      "app/docs/option-list/content.mdx",
    );
    const content = fs.readFileSync(contentPath, "utf8");

    expect(content).toContain("choice");
    expect(content).not.toContain("confirmed");
  });

  test("describes current accessibility implementation", () => {
    const contentPath = path.resolve(
      process.cwd(),
      "app/docs/option-list/content.mdx",
    );
    const content = fs.readFileSync(contentPath, "utf8");

    expect(content).not.toContain("Selection controls use Radix primitives");
  });
});
