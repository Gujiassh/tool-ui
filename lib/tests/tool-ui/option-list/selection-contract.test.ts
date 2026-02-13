import { describe, expect, test } from "vitest";
import { normalizeSelectionForOptions } from "@/components/tool-ui/option-list/selection";
import { normalizeActionsConfig } from "@/components/tool-ui/shared/actions-config";

describe("option-list selection contract", () => {
  test("prunes selected ids that are not present in options", () => {
    const next = normalizeSelectionForOptions(
      new Set(["alpha", "stale"]),
      new Set(["alpha", "beta"]),
    );

    expect(Array.from(next)).toEqual(["alpha"]);
  });

  test("keeps known ids stable", () => {
    const prev = new Set(["alpha", "beta"]);
    const next = normalizeSelectionForOptions(prev, new Set(["alpha", "beta"]));

    expect(Array.from(next)).toEqual(["alpha", "beta"]);
  });

  test("treats empty actions arrays as not configured", () => {
    expect(normalizeActionsConfig([])).toBeNull();
  });
});
