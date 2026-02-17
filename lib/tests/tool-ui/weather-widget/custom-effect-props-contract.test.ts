import { describe, expect, test } from "vitest";

import { mapCustomEffectPropsToCanvasProps } from "@/lib/weather-authoring/weather-widget/effects/effect-compositor-custom-props";
import { resolveWeatherEffectsCanvasRuntimeProps } from "@/lib/weather-authoring/weather-widget/effects/weather-effects-props";
import {
  DEFAULT_CLOUD,
  DEFAULT_RAIN,
  DEFAULT_SNOW,
} from "@/lib/weather-authoring/weather-widget/effects/weather-effects-defaults";

describe("weather-widget custom effect props contract", () => {
  test("omitted optional custom cloud fields do not clobber runtime defaults", () => {
    const mapped = mapCustomEffectPropsToCanvasProps({
      cloud: {
        coverage: 0.35,
        windSpeed: 0.12,
        turbulence: 0.2,
        sunAltitude: 0.4,
        ambientDarkness: 0.3,
        starDensity: 0.5,
      },
    });

    expect(mapped).not.toBeNull();
    const runtime = resolveWeatherEffectsCanvasRuntimeProps(mapped!);

    expect(runtime.cloud.windAngle).toBe(DEFAULT_CLOUD.windAngle);
    expect(runtime.cloud.density).toBe(DEFAULT_CLOUD.density);
    expect(runtime.cloud.numLayers).toBe(DEFAULT_CLOUD.numLayers);
  });

  test("omitted optional rain/snow fields preserve runtime defaults", () => {
    const mapped = mapCustomEffectPropsToCanvasProps({
      rain: {
        glassIntensity: 0.6,
        fallingIntensity: 0.5,
        fallingAngle: 0.2,
      },
      snow: {
        intensity: 0.4,
        windSpeed: 0.2,
        drift: 0.3,
      },
    });

    expect(mapped).not.toBeNull();
    const runtime = resolveWeatherEffectsCanvasRuntimeProps(mapped!);

    expect(runtime.rain.fallingSpeed).toBe(DEFAULT_RAIN.fallingSpeed);
    expect(runtime.rain.fallingStreakLength).toBe(DEFAULT_RAIN.fallingStreakLength);
    expect(runtime.snow.layers).toBe(DEFAULT_SNOW.layers);
    expect(runtime.snow.flakeSize).toBe(DEFAULT_SNOW.flakeSize);
  });
});
