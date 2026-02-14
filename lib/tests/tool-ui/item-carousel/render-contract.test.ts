import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { ItemCarousel } from "@/components/tool-ui/item-carousel";

describe("item-carousel render contract", () => {
  test("uses standard tool-ui root attributes", () => {
    const html = renderToStaticMarkup(
      createElement(ItemCarousel, {
        id: "item-carousel-contract",
        items: [
          {
            id: "item-1",
            name: "First item",
            subtitle: "Example",
            color: "#ff0000",
          },
        ],
      }),
    );

    expect(html).toContain('data-tool-ui-id="item-carousel-contract"');
    expect(html).toContain('data-slot="item-carousel"');
    expect(html).not.toContain("data-item-carousel-id=");
  });

  test("does not use role=button on card containers", () => {
    const html = renderToStaticMarkup(
      createElement(ItemCarousel, {
        id: "item-carousel-interactive-contract",
        items: [
          {
            id: "item-1",
            name: "First item",
            subtitle: "Example",
            color: "#ff0000",
            actions: [{ id: "save", label: "Save" }],
          },
        ],
        onItemClick: () => undefined,
        onItemAction: () => undefined,
      }),
    );

    expect(html).not.toContain('role="button"');
  });

  test("keeps standard root attributes when empty", () => {
    const html = renderToStaticMarkup(
      createElement(ItemCarousel, {
        id: "item-carousel-empty-contract",
        items: [],
      }),
    );

    expect(html).toContain('data-tool-ui-id="item-carousel-empty-contract"');
    expect(html).toContain('data-slot="item-carousel"');
  });

  test("exposes compound subcomponents via ItemCarousel.Subcomponent syntax", () => {
    expect(typeof ItemCarousel.Root).toBe("function");
    expect(typeof ItemCarousel.Header).toBe("function");
    expect(typeof ItemCarousel.EmptyState).toBe("function");
    expect(typeof ItemCarousel.NavButton).toBe("function");
    expect(typeof ItemCarousel.Card).toBe("function");
  });

  test("renders from ItemCarousel.Root compound entrypoint", () => {
    const html = renderToStaticMarkup(
      createElement(ItemCarousel.Root, {
        id: "item-carousel-root-compound",
        items: [
          {
            id: "item-1",
            name: "First item",
            subtitle: "Example",
            color: "#ff0000",
          },
        ],
      }),
    );

    expect(html).toContain('data-tool-ui-id="item-carousel-root-compound"');
    expect(html).toContain('data-slot="item-carousel"');
  });
});
