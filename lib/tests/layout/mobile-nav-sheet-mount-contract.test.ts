import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/docs/overview",
}));

describe("mobile nav sheet mount contract", () => {
  it("does not mount sheet markup by default before mobile viewport is confirmed", async () => {
    const { MobileNavSheet } = await import(
      "@/app/components/layout/mobile-nav-sheet.client"
    );

    const html = renderToStaticMarkup(createElement(MobileNavSheet));

    expect(html).toBe("");
  });
});
