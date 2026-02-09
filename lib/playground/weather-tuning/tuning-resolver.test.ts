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

  test("condition curves override base values at checkpoints", () => {
    const base = baseFor("clear");
    const config: WeatherTuningConfig = {
      version: 1,
      conditions: {
        clear: {
          curves: {
            "celestial.skyBrightness": { knots: [{ t: 0.5, value: 1.1 }] },
          },
        },
      },
    };

    const result = resolveWeatherParams({
      config,
      condition: "clear",
      timeOfDay: 0.5,
      baseParams: base,
    });

    expect(result.celestial.skyBrightness).toBeCloseTo(1.1, 6);
  });

  test("missing checkpoint knot leaves base values", () => {
    const base = baseFor("clear");
    const config: WeatherTuningConfig = {
      version: 1,
      conditions: {
        clear: {
          curves: {
            "celestial.skyBrightness": { knots: [{ t: 0.25, value: 0.2 }] },
          },
        },
      },
    };

    const result = resolveWeatherParams({
      config,
      condition: "clear",
      timeOfDay: 0.5,
      baseParams: base,
    });

    expect(result.celestial.skyBrightness).toBe(base.celestial.skyBrightness);
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
