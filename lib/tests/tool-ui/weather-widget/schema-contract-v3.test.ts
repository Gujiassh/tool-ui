import { describe, expect, test } from "vitest";

import {
  WeatherWidgetPayloadSchema,
  safeParseWeatherWidgetPayload,
  type WeatherWidgetPayload,
} from "@/lib/weather-authoring/weather-widget/schema";

function makeBasePayload(): WeatherWidgetPayload {
  return {
    version: "3.1",
    id: "weather-widget-v3-test",
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
        conditionCode: "rain",
        tempMin: 50,
        tempMax: 56,
      },
    ],
    time: {
      timeBucket: 3,
    },
  };
}

describe("weather-widget v3.1 schema contract", () => {
  test("accepts payload with time.timeBucket only", () => {
    const payload = makeBasePayload();
    const result = WeatherWidgetPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  test("accepts payload with time.localTimeOfDay only", () => {
    const payload = makeBasePayload();
    payload.time = { localTimeOfDay: 0.375 };
    const result = WeatherWidgetPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  test("rejects payload when time is empty", () => {
    const payload = makeBasePayload();
    payload.time = {};
    const result = WeatherWidgetPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  test("rejects payload when localTimeOfDay and timeBucket disagree", () => {
    const payload = makeBasePayload();
    payload.time = { timeBucket: 11, localTimeOfDay: 0.1 };
    const result = WeatherWidgetPayloadSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  test("safe parser returns null for invalid payload", () => {
    const payload = makeBasePayload();
    payload.time = {};
    expect(safeParseWeatherWidgetPayload(payload)).toBeNull();
  });
});
