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
});
