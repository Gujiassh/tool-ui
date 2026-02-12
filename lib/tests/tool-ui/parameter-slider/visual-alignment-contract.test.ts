import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { ParameterSlider } from "@/components/tool-ui/parameter-slider";

describe("parameter-slider visual alignment contract", () => {
  test("keeps fill edge in the same inset coordinate system as the thumb", () => {
    const html = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-alignment-test",
        sliders: [
          {
            id: "s",
            label: "S",
            min: -100,
            max: 100,
            value: 75,
          },
        ],
      }),
    );

    expect(html).toContain(
      "clip-path:inset(0 calc(100% - calc(87.5% + -4.5px)) 0 calc(50% + 0px))",
    );
  });
});
