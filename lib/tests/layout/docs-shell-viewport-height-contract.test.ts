import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/components/layout/app-header.server", () => ({
  ResponsiveHeader: () => createElement("header", { "data-slot": "responsive-header" }),
}));

describe("docs shell viewport height contract", () => {
  it("inherits viewport height from root layout to avoid first-load reflow", async () => {
    const { HeaderFrame } = await import("@/app/components/layout/app-shell");

    const html = renderToStaticMarkup(
      createElement(HeaderFrame, null, createElement("main", null, "content")),
    );

    expect(html).toContain("h-full");
    expect(html).not.toContain("h-dvh");
    expect(html).not.toContain("h-svh");
  });
});
