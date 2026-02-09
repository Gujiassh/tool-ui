import { describe, expect, test } from "vitest";

import type { WeatherTuningConfig } from "@/app/sandbox/weather-compositor/tuning/tuning-schema";
import {
  buildParamCatalogFromBase,
  resolveWeatherParams,
} from "@/app/sandbox/weather-compositor/tuning/tuning-resolver";
import { getBaseParamsForCondition } from "@/app/sandbox/weather-compositor/presets";

const BASE_TIMESTAMP = "2025-01-01T12:00:00Z";

function baseFor(condition: "clear" | "drizzle" | "rain") {
  return getBaseParamsForCondition(condition, BASE_TIMESTAMP);
}

describe("weather tuning resolver", () => {
  test("uses base values when no curves are provided", () => {
    const base = baseFor("clear");
    const config: WeatherTuningConfig = {
      version: 1,
      conditions: {},
    };

    const result = resolveWeatherParams({
      config,
      condition: "clear",
      timeOfDay: 0.5,
      baseParams: base,
    });

    expect(result.celestial.skyBrightness).toBe(base.celestial.skyBrightness);
  });

  test("global curves override base values", () => {
    const base = baseFor("clear");
    const config: WeatherTuningConfig = {
      version: 1,
      global: {
        "celestial.skyBrightness": {
          knots: [
            { t: 0, value: 0 },
            { t: 1, value: 1 },
          ],
        },
      },
      conditions: {},
    };

    const result = resolveWeatherParams({
      config,
      condition: "clear",
      timeOfDay: 0.5,
      baseParams: base,
    });

    expect(result.celestial.skyBrightness).toBeCloseTo(0.5, 5);
  });

  test("delta curves add to base values", () => {
    const base = baseFor("clear");
    const config: WeatherTuningConfig = {
      version: 1,
      global: {
        "celestial.skyBrightness": {
          knots: [{ t: 0, value: 0.2 }],
          mode: "delta",
        },
      },
      conditions: {},
    };

    const result = resolveWeatherParams({
      config,
      condition: "clear",
      timeOfDay: 0.5,
      baseParams: base,
    });

    expect(result.celestial.skyBrightness).toBeCloseTo(
      base.celestial.skyBrightness + 0.2,
      6,
    );
  });

  test("condition inheritance applies parent then child curves", () => {
    const config: WeatherTuningConfig = {
      version: 1,
      global: {
        "cloud.coverage": {
          knots: [{ t: 0, value: 0.1 }],
        },
      },
      conditions: {
        drizzle: {
          curves: {
            "cloud.coverage": { knots: [{ t: 0, value: 0.25 }] },
          },
        },
        rain: {
          parent: "drizzle",
          curves: {
            "cloud.coverage": { knots: [{ t: 0, value: 0.4 }] },
          },
        },
      },
    };

    const drizzleBase = baseFor("drizzle");
    const rainBase = baseFor("rain");

    const drizzle = resolveWeatherParams({
      config,
      condition: "drizzle",
      timeOfDay: 0.5,
      baseParams: drizzleBase,
    });

    const rain = resolveWeatherParams({
      config,
      condition: "rain",
      timeOfDay: 0.5,
      baseParams: rainBase,
    });

    expect(drizzle.cloud.coverage).toBeCloseTo(0.25, 6);
    expect(rain.cloud.coverage).toBeCloseTo(0.4, 6);
  });

  test("special cases override by priority", () => {
    const base = baseFor("clear");
    const config: WeatherTuningConfig = {
      version: 1,
      conditions: {},
      specialCases: [
        {
          when: { condition: "clear", timeRange: [0.4, 0.6] },
          curves: {
            "celestial.skyBrightness": { knots: [{ t: 0, value: 0.2 }] },
          },
          priority: 1,
        },
        {
          when: { condition: "clear", timeRange: [0.4, 0.6] },
          curves: {
            "celestial.skyBrightness": { knots: [{ t: 0, value: 0.8 }] },
          },
          priority: 10,
        },
      ],
    };

    const result = resolveWeatherParams({
      config,
      condition: "clear",
      timeOfDay: 0.5,
      baseParams: base,
    });

    expect(result.celestial.skyBrightness).toBeCloseTo(0.8, 6);
  });

  test("curves wrap across midnight", () => {
    const base = baseFor("clear");
    const config: WeatherTuningConfig = {
      version: 1,
      global: {
        "celestial.skyBrightness": {
          knots: [
            { t: 0.75, value: 0.75 },
            { t: 0.1, value: 0.1 },
          ],
        },
      },
      conditions: {},
    };

    const result = resolveWeatherParams({
      config,
      condition: "clear",
      timeOfDay: 0.95,
      baseParams: base,
    });

    expect(result.celestial.skyBrightness).toBeCloseTo(0.3786, 3);
  });

  test("param catalog builder excludes celestial.timeOfDay", () => {
    const base = baseFor("clear");
    const catalog = buildParamCatalogFromBase(base);
    const hasTimeOfDay = catalog.some(
      (meta) => meta.id === "celestial.timeOfDay",
    );

    expect(hasTimeOfDay).toBe(false);
  });
});
