import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const PROJECT_ROOT = process.cwd();
const PLAN_DOCS_PATH = path.join(PROJECT_ROOT, "app/docs/plan/content.mdx");

describe("plan docs contract", () => {
  const content = fs.readFileSync(PLAN_DOCS_PATH, "utf8");

  test("status descriptions match current visual language", () => {
    expect(content).toContain("Spinner icon");
    expect(content).not.toContain("dashed circle");
    expect(content).not.toContain("strikethrough");
  });
});
