import { describe, expect, it } from "vitest";
import {
  DecisionResultSchema,
  createDecisionResult,
} from "@/components/tool-ui/shared/schema";

describe("decision result envelope contract", () => {
  it("creates a valid v1 decision envelope", () => {
    const result = createDecisionResult({
      decisionId: "order-123",
      action: { id: "confirm", label: "Confirm" },
      payload: { orderId: "ORD-42" },
    });

    expect(result.kind).toBe("decision");
    expect(result.version).toBe(1);
    expect(result.decisionId).toBe("order-123");
    expect(result.actionId).toBe("confirm");
    expect(result.actionLabel).toBe("Confirm");
    expect(DecisionResultSchema.safeParse(result).success).toBe(true);
  });

  it("allows empty payload and keeps envelope shape", () => {
    const result = createDecisionResult({
      decisionId: "approval-001",
      action: { id: "reject", label: "Reject" },
    });

    expect(result.payload).toBeUndefined();
    expect(DecisionResultSchema.safeParse(result).success).toBe(true);
  });
});
