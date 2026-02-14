import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OrderSummary } from "@/components/tool-ui/order-summary";

const baseOrderSummary = {
  id: "order-summary-render-contract",
  items: [
    {
      id: "item-1",
      name: "Wireless Keyboard",
      description: "Low-profile mechanical switches",
      imageUrl: "https://example.com/keyboard.jpg",
      unitPrice: 79.99,
      quantity: 2,
    },
  ],
  pricing: {
    subtotal: 159.98,
    tax: 6.4,
    taxLabel: "Sales Tax",
    shipping: 0,
    discount: 10,
    discountLabel: "Promo",
    total: 156.38,
    currency: "USD",
  },
};

describe("order summary render contract", () => {
  it("is server-renderable", () => {
    expect(() =>
      renderToStaticMarkup(React.createElement(OrderSummary, baseOrderSummary)),
    ).not.toThrow();
  });

  it("renders display-only order details with no actions", () => {
    const html = renderToStaticMarkup(
      React.createElement(OrderSummary, baseOrderSummary),
    );

    expect(html).toContain("Wireless Keyboard");
    expect(html).toContain("Low-profile mechanical switches");
    expect(html).toContain("Qty: 2");
    expect(html).toContain("Promo");
    expect(html).toContain("Shipping");
    expect(html).toContain("Free");
    expect(html).toContain("Sales Tax");
    expect(html).toContain('alt="Wireless Keyboard"');
    expect(html).not.toContain("@container/actions");
    expect(html).not.toContain("<button");
  });

  it("renders receipt metadata and hides decorative status icon from AT", () => {
    const html = renderToStaticMarkup(
      React.createElement(OrderSummary, {
        ...baseOrderSummary,
        choice: {
          action: "confirm" as const,
          orderId: "ORD-42",
          confirmedAt: "2026-01-10T11:35:00.000Z",
        },
      }),
    );

    expect(html).toContain("#ORD-42");
    expect(html).toContain("Order Summary");
    expect(html).toContain('aria-hidden="true"');
  });

  it("gracefully handles malformed runtime payloads", () => {
    const html = renderToStaticMarkup(
      React.createElement(OrderSummary, {
        id: "bad-order",
        title: "Broken",
        items: [] as never[],
        pricing: undefined as never,
      }),
    );

    expect(html).toContain("Unable to render order summary");
  });
});
