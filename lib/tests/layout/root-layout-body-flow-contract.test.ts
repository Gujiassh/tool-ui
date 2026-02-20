import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("geist/font/sans", () => ({
  GeistSans: { variable: "geist-sans" },
}));

vi.mock("geist/font/mono", () => ({
  GeistMono: { variable: "geist-mono" },
}));

vi.mock("@/app/components/layout/mobile-nav-sheet-gate.client", () => ({
  MobileNavSheetGate: () => null,
}));

vi.mock("@/app/components/analytics/posthog-init.client", () => ({
  PostHogInit: () => null,
}));

describe("root layout body flow contract", () => {
  it("keeps body out of flex flow so transient body siblings cannot shrink the app shell", async () => {
    const { default: RootLayout } = await import("@/app/layout");

    const html = renderToStaticMarkup(
      createElement(RootLayout, null, createElement("main", null, "content")),
    );

    expect(html).toContain("<body class=\"bg-background overscroll-none\">");
    expect(html).toContain("id=\"app-root\"");
    expect(html).toContain("class=\"flex h-screen h-svh flex-col\"");
  });

  it("paints the html root with themed background to avoid white flashes during viewport resize", async () => {
    const { default: RootLayout } = await import("@/app/layout");

    const html = renderToStaticMarkup(
      createElement(RootLayout, null, createElement("main", null, "content")),
    );

    expect(html).toMatch(/<html[^>]*class="[^"]*bg-background[^"]*"/);
  });
});
