import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LinkValue } from "@/components/tool-ui/data-table/formatters";

describe("data-table link sanitization contract", () => {
  it("allows safe relative href values", () => {
    const html = renderToStaticMarkup(
      createElement(LinkValue, {
        value: "Docs",
        row: { target: "/docs/getting-started" },
        options: { kind: "link", hrefKey: "target" },
      }),
    );

    expect(html).toContain('href="/docs/getting-started"');
  });

  it("rejects protocol-relative href values", () => {
    const html = renderToStaticMarkup(
      createElement(LinkValue, {
        value: "Bad",
        row: { target: "//evil.example.com" },
        options: { kind: "link", hrefKey: "target" },
      }),
    );

    expect(html).not.toContain('href="//evil.example.com"');
  });
});
