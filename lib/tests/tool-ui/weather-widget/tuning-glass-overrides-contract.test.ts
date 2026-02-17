import { describe, expect, test } from "vitest";

import { applyWeatherEffectsOverrides } from "@/lib/weather-authoring/weather-widget/effects/tuning";
import type { WeatherEffectsCanvasProps } from "@/lib/weather-authoring/weather-widget/effects/weather-effects-types";

describe("weather-widget tuning glass overrides contract", () => {
  test("applyWeatherEffectsOverrides merges glass overrides", () => {
    const base = {
      glass: {
        blur: 2.5,
        brightness: 0.9,
      },
    } as WeatherEffectsCanvasProps & {
      glass: {
        blur?: number;
        brightness?: number;
        saturation?: number;
      };
    };

    const merged = applyWeatherEffectsOverrides(base, {
      glass: {
        brightness: 1.0,
        saturation: 1.2,
      },
    }) as WeatherEffectsCanvasProps & {
      glass?: {
        blur?: number;
        brightness?: number;
        saturation?: number;
      };
    };

    expect(merged.glass).toEqual({
      blur: 2.5,
      brightness: 1.0,
      saturation: 1.2,
    });
  });
});
