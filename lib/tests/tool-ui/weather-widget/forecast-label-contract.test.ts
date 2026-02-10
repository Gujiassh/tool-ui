import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { WeatherWidget } from "@/components/tool-ui/weather-widget";

describe("weather-widget forecast label contract", () => {
  test("renders forecast labels exactly as provided by payload", () => {
    const html = renderToStaticMarkup(
      createElement(WeatherWidget, {
        version: "3.1",
        id: "weather-label-test",
        location: { name: "San Francisco, CA" },
        units: { temperature: "fahrenheit" },
        current: {
          conditionCode: "rain",
          temperature: 54,
          tempMin: 51,
          tempMax: 58,
        },
        forecast: [
          {
            label: "Tue",
            conditionCode: "heavy-rain",
            tempMin: 50,
            tempMax: 56,
          },
          {
            label: "Wed",
            conditionCode: "rain",
            tempMin: 49,
            tempMax: 55,
          },
        ],
        time: {
          timeBucket: 9,
        },
      }),
    );

    expect(html).toContain(">Tue<");
    expect(html).not.toContain(">Now<");
  });
});
