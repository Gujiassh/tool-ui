import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { WeatherWidget } from "@/components/tool-ui/weather-widget";

function getClassForDataSlot(html: string, dataSlot: string): string {
  const pattern = new RegExp(
    `data-slot="${dataSlot}"[^>]*class="([^"]+)"`,
  );
  const match = html.match(pattern);
  if (!match) {
    throw new Error(`Could not find class for data-slot="${dataSlot}"`);
  }
  return match[1];
}

describe("weather-widget layout containment", () => {
  test("keeps size containment off the outer wrapper to avoid collapsing height", () => {
    const html = renderToStaticMarkup(
      createElement(WeatherWidget, {
        id: "weather-1",
        location: "San Francisco, CA",
        current: {
          temp: 72,
          tempMin: 65,
          tempMax: 78,
          condition: "snow",
        },
        forecast: [
          { day: "Now", tempMin: 65, tempMax: 78, condition: "snow" },
          { day: "Tue", tempMin: 64, tempMax: 77, condition: "snow" },
          { day: "Wed", tempMin: 62, tempMax: 75, condition: "snow" },
          { day: "Thu", tempMin: 60, tempMax: 73, condition: "snow" },
          { day: "Fri", tempMin: 63, tempMax: 76, condition: "snow" },
        ],
        unit: "fahrenheit",
      }),
    );

    const wrapperClass = getClassForDataSlot(html, "weather-widget");
    const cardClass = getClassForDataSlot(html, "card");

    expect(wrapperClass).not.toContain("[container-type:size]");
    expect(cardClass).toContain("@container/weather");
    expect(cardClass).toContain("[container-type:size]");
  });
});
