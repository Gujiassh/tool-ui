import { describe, expect, test } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("parameter-slider docs contract", () => {
  test("documents unified actions prop as Action[] or ActionsConfig", () => {
    const contentPath = path.resolve(
      process.cwd(),
      "app/docs/parameter-slider/content.mdx",
    );
    const content = fs.readFileSync(contentPath, "utf8");

    expect(content).toContain("actions");
    expect(content).toContain('type: "Action[] | ActionsConfig"');
    expect(content).not.toContain("adjustmentActions");
    expect(content).not.toContain("onAdjustmentAction");
    expect(content).not.toContain("onBeforeAdjustmentAction");
  });
});
