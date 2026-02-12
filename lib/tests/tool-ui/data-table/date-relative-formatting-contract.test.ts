import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DateValue } from "@/components/tool-ui/data-table/formatters";

describe("data-table date relative formatting contract", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-12T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps near-now values as just now", () => {
    const html = renderToStaticMarkup(
      createElement(DateValue, {
        value: "2026-02-12T11:59:35.000Z",
        options: { kind: "date", dateFormat: "relative" },
        locale: "en-US",
      }),
    );

    expect(html).toContain("just now");
  });

  it("formats past values as relative time", () => {
    const html = renderToStaticMarkup(
      createElement(DateValue, {
        value: "2026-02-12T10:00:00.000Z",
        options: { kind: "date", dateFormat: "relative" },
        locale: "en-US",
      }),
    );

    expect(html).toContain("2 hours ago");
  });

  it("formats future values as relative time", () => {
    const html = renderToStaticMarkup(
      createElement(DateValue, {
        value: "2026-02-12T14:00:00.000Z",
        options: { kind: "date", dateFormat: "relative" },
        locale: "en-US",
      }),
    );

    expect(html).toContain("in 2 hours");
  });
});
