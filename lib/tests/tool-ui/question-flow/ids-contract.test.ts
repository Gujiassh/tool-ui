import { describe, expect, it } from "vitest";
import { getQuestionFlowStepIds } from "@/components/tool-ui/question-flow/question-flow";

describe("question-flow accessible id contracts", () => {
  it("creates unique title/description ids per step key", () => {
    const first = getQuestionFlowStepIds("checkout-flow", "shipping");
    const second = getQuestionFlowStepIds("checkout-flow", "payment");

    expect(first.titleId).toBe("checkout-flow-shipping-title");
    expect(first.descriptionId).toBe("checkout-flow-shipping-description");
    expect(second.titleId).toBe("checkout-flow-payment-title");
    expect(second.descriptionId).toBe("checkout-flow-payment-description");
    expect(first.titleId).not.toBe(second.titleId);
  });

  it("sanitizes ids for aria references", () => {
    const ids = getQuestionFlowStepIds("checkout flow", "shipping & billing");

    expect(ids.titleId).toBe("checkout_20flow-shipping_20_26_20billing-title");
    expect(ids.descriptionId).toBe(
      "checkout_20flow-shipping_20_26_20billing-description",
    );
    expect(ids.titleId).not.toMatch(/\s/);
    expect(ids.descriptionId).not.toMatch(/\s/);
  });
});
