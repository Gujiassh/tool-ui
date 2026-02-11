import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { GlassPanelCSS } from "@/components/tool-ui/weather-widget/effects/glass-panel-svg";

describe("glass panel style contract", () => {
  it("does not emit invalid jsx attribute warnings", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    renderToStaticMarkup(React.createElement(GlassPanelCSS));

    const messages = consoleError.mock.calls.map((call) =>
      call.map((arg) => String(arg)).join(" "),
    );

    consoleError.mockRestore();

    expect(
      messages.some((message) =>
        message.includes("Received `true` for a non-boolean attribute `jsx`"),
      ),
    ).toBe(false);
  });
});
