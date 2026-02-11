import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const DOC_PATH = path.join(
  process.cwd(),
  "app/docs/preferences-panel/content.mdx",
);

describe("preferences-panel docs toolkit contract", () => {
  test("toolkit addResult example uses receipt-shaped payload", () => {
    const content = fs.readFileSync(DOC_PATH, "utf8");

    expect(content).toContain("addResult({ choice:");
    expect(content).not.toContain('addResult({ status: "saved"');
    expect(content).not.toContain('addResult({ status: "cancelled"');
  });
});
