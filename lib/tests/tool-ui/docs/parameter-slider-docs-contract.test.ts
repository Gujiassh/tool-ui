import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("parameter-slider docs contract", () => {
  test("documents adjustmentActions as Action[] or ActionsConfig", () => {
    const contentPath = path.resolve(
      process.cwd(),
      "app/docs/parameter-slider/content.mdx",
    );
    const content = fs.readFileSync(contentPath, "utf8");

    expect(content).toContain('type: "Action[] | ActionsConfig"');
  });
});
