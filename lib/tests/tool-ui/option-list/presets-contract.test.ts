import { describe, expect, test } from "vitest";
import { optionListPresets } from "@/lib/presets/option-list";

describe("option-list presets contract", () => {
  test("uses choice-oriented receipt copy", () => {
    expect(optionListPresets.receipt.description).toBe(
      "Selected travel mode (receipt state)",
    );
  });

  test("includes a multi-select receipt preset", () => {
    const preset = optionListPresets["receipt-multi"];
    expect(preset.data.selectionMode).toBe("multi");
    expect(preset.data.choice).toEqual([
      "code-review",
      "tests-pass",
      "docs-updated",
    ]);
  });

  test("generates array choice syntax for multi-select receipts", () => {
    const preset = optionListPresets["receipt-multi"];
    const code = preset.generateExampleCode(preset.data);
    expect(code).toContain('choice={["code-review","tests-pass","docs-updated"]}');
  });
});
