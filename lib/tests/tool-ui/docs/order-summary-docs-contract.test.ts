import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const ORDER_SUMMARY_DOCS_PATH = path.join(
  process.cwd(),
  "app/docs/order-summary/content.mdx",
);

describe("order-summary docs contract", () => {
  test("documents Display and Receipt variants explicitly", () => {
    const content = fs.readFileSync(ORDER_SUMMARY_DOCS_PATH, "utf8");

    expect(content).toContain("OrderSummary.Display");
    expect(content).toContain("OrderSummary.Receipt");
    expect(content).not.toContain(
      "Pass `choice` after confirmation to switch it into a read-only receipt.",
    );
    expect(content).not.toContain(
      'choice: {\n      description: "When set, renders the receipt state"',
    );
  });
});
