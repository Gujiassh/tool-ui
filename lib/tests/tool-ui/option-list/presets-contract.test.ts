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

  test("does not include onConfirm in receipt-mode examples", () => {
    const receiptCode = optionListPresets.receipt.generateExampleCode(
      optionListPresets.receipt.data,
    );
    const receiptMultiCode = optionListPresets["receipt-multi"].generateExampleCode(
      optionListPresets["receipt-multi"].data,
    );

    expect(receiptCode).not.toContain("onConfirm=");
    expect(receiptMultiCode).not.toContain("onConfirm=");
  });

  test("uses unified action callback in interactive examples", () => {
    const interactiveCode = optionListPresets.travel.generateExampleCode(
      optionListPresets.travel.data,
    );

    expect(interactiveCode).toContain("onAction=");
    expect(interactiveCode).not.toContain("onConfirm=");
  });
});
