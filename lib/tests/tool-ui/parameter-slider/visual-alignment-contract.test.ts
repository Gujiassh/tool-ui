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
    expect(html).toContain("white calc(87.5% + -4.5px)");
  });

  test("does not leave a fill gap at the track border for non-crossing sliders", () => {
    const html = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-border-gap-test",
        sliders: [
          {
            id: "s",
            label: "S",
            min: 0,
            max: 100,
            value: 50,
          },
        ],
      }),
    );

    expect(html).toContain(
      "clip-path:inset(0 calc(100% - calc(50% + 0px)) 0 0)",
    );
  });

  test("snaps non-crossing fill to exact borders at terminal values", () => {
    const minHtml = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-border-min-test",
        sliders: [
          {
            id: "s",
            label: "S",
            min: 0,
            max: 100,
            value: 0,
          },
        ],
      }),
    );
    const maxHtml = renderToStaticMarkup(
      React.createElement(ParameterSlider, {
        id: "parameter-slider-border-max-test",
        sliders: [
          {
            id: "s",
            label: "S",
            min: 0,
            max: 100,
            value: 100,
          },
        ],
      }),
    );

    // Min: no visible fill strip at the left edge.
    expect(minHtml).toContain("clip-path:inset(0 100% 0 0)");
    // Max: no visible gap at the right edge.
    expect(maxHtml).toContain("clip-path:inset(0 0 0 0)");
  });
});
