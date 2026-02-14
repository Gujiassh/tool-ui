import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/components/layout/app-header.server", () => ({
  ResponsiveHeader: () => createElement("header", { "data-slot": "responsive-header" }),
}));

describe("app shell header animation contract", () => {
  it("includes the navbar entrance class on first render of AnimatedHeaderFrame", async () => {
    vi.resetModules();

    const { AnimatedHeaderFrame } = await import(
      "@/app/components/layout/app-shell-animated.client"
    );

    const html = renderToStaticMarkup(
      createElement(AnimatedHeaderFrame, null, createElement("main", null, "content")),
    );

    expect(html).toContain("animate-navbar-fade-in");
  });
});
