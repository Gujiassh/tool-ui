import { describe, expect, it } from "vitest";
import {
  parseSerializableOrderSummary,
  safeParseSerializableOrderSummary,
} from "@/components/tool-ui/order-summary/schema";

const baseOrderSummary = {
  id: "order-summary-schema-contract",
  items: [
    {
      id: "item-1",
      name: "Noise Cancelling Headphones",
      unitPrice: 199.99,
      quantity: 1,
    },
  ],
  pricing: {
    subtotal: 199.99,
    tax: 18.0,
    shipping: 0,
    total: 217.99,
    currency: "USD",
  },
};

describe("order summary schema contract", () => {
  it("accepts valid payloads", () => {
    const parsed = parseSerializableOrderSummary({
      ...baseOrderSummary,
      variant: "receipt",
      choice: {
        action: "confirm" as const,
        orderId: "ORD-42",
        confirmedAt: "2026-01-10T11:35:00.000Z",
      },
    });

    expect(parsed.id).toBe(baseOrderSummary.id);
    expect(parsed.choice?.orderId).toBe("ORD-42");
  });

  it("accepts explicit summary variant without choice", () => {
    const parsed = parseSerializableOrderSummary({
      ...baseOrderSummary,
      variant: "summary",
    });

    expect(parsed.variant).toBe("summary");
  });

  it("rejects receipt variant without choice", () => {
    const payload = {
      ...baseOrderSummary,
      variant: "receipt",
    };

    expect(() => parseSerializableOrderSummary(payload)).toThrow();
    expect(safeParseSerializableOrderSummary(payload)).toBeNull();
  });

  it("rejects summary variant with choice", () => {
    const payload = {
      ...baseOrderSummary,
      variant: "summary",
      choice: {
        action: "confirm" as const,
        orderId: "ORD-42",
      },
    };

    expect(() => parseSerializableOrderSummary(payload)).toThrow();
    expect(safeParseSerializableOrderSummary(payload)).toBeNull();
  });

  it("rejects duplicate item ids", () => {
    const payload = {
      ...baseOrderSummary,
      items: [
        ...baseOrderSummary.items,
        {
          id: "item-1",
          name: "Duplicate id item",
          unitPrice: 10,
        },
      ],
    };

    expect(() => parseSerializableOrderSummary(payload)).toThrow();
    expect(safeParseSerializableOrderSummary(payload)).toBeNull();
  });

  it("rejects negative discount values", () => {
    const payload = {
      ...baseOrderSummary,
      pricing: {
        ...baseOrderSummary.pricing,
        discount: -10,
      },
    };

    expect(() => parseSerializableOrderSummary(payload)).toThrow();
    expect(safeParseSerializableOrderSummary(payload)).toBeNull();
  });

  it("rejects responseActions in display-only payloads", () => {
    const payload = {
      ...baseOrderSummary,
      responseActions: [{ id: "confirm", label: "Confirm order" }],
    };

    expect(() => parseSerializableOrderSummary(payload)).toThrow();
    expect(safeParseSerializableOrderSummary(payload)).toBeNull();
  });

  it("rejects unknown legacy props in strict payload parsing", () => {
    const payload = {
      ...baseOrderSummary,
      onResponseAction: "legacy-handler",
    };

    expect(() => parseSerializableOrderSummary(payload)).toThrow();
    expect(safeParseSerializableOrderSummary(payload)).toBeNull();
  });
});
