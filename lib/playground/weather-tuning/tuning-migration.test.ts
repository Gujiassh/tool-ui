import { describe, expect, test } from "vitest";

import type { CheckpointOverrides } from "@/app/sandbox/weather-compositor/presets";
import { getBaseParamsForCondition } from "@/app/sandbox/weather-compositor/presets";
import { TIME_CHECKPOINTS } from "@/app/sandbox/weather-tuning/lib/constants";
import { checkpointOverridesToConfig } from "@/app/sandbox/weather-compositor/tuning/migrate-checkpoints";
import { resolveWeatherParams } from "@/app/sandbox/weather-compositor/tuning/tuning-resolver";

function timestampFor(timeOfDay: number): string {
  const date = new Date("2025-01-01T00:00:00Z");
  const hours = Math.floor(timeOfDay * 24);
  const minutes = Math.floor((timeOfDay * 24 - hours) * 60);
  date.setUTCHours(hours, minutes, 0, 0);
  return date.toISOString();
}

describe("checkpoint overrides migration", () => {
  test("numeric overrides become delta curves", () => {
    const time = TIME_CHECKPOINTS.dawn.value;
    const base = getBaseParamsForCondition("clear", timestampFor(time));
    base.celestial.timeOfDay = time;

    const overrides: CheckpointOverrides = {
      dawn: { celestial: { skyBrightness: base.celestial.skyBrightness + 0.2 } },
      noon: {},
      dusk: {},
      midnight: {},
    };

    const config = checkpointOverridesToConfig({ clear: overrides });
    const curve = config.conditions?.clear?.curves?.["celestial.skyBrightness"];

    expect(curve?.mode).toBe("delta");

    const resolved = resolveWeatherParams({
      config,
      condition: "clear",
      timeOfDay: time,
      baseParams: base,
    });

    expect(resolved.celestial.skyBrightness).toBeCloseTo(
      base.celestial.skyBrightness + 0.2,
      6,
    );
  });

  test("boolean overrides are absolute step curves", () => {
    const noon = TIME_CHECKPOINTS.noon.value;
    const dawn = TIME_CHECKPOINTS.dawn.value;

    const baseNoon = getBaseParamsForCondition("rain", timestampFor(noon));
    baseNoon.celestial.timeOfDay = noon;

    const baseDawn = getBaseParamsForCondition("rain", timestampFor(dawn));
    baseDawn.celestial.timeOfDay = dawn;

    const overrides: CheckpointOverrides = {
      dawn: {},
      noon: { layers: { rain: false } },
      dusk: {},
      midnight: {},
    };

    const config = checkpointOverridesToConfig({ rain: overrides });
    const curve = config.conditions?.rain?.curves?.["layers.rain"];

    expect(curve?.interpolation).toBe("step");

    const resolvedNoon = resolveWeatherParams({
      config,
      condition: "rain",
      timeOfDay: noon,
      baseParams: baseNoon,
    });

    const resolvedDawn = resolveWeatherParams({
      config,
      condition: "rain",
      timeOfDay: dawn,
      baseParams: baseDawn,
    });

    expect(resolvedNoon.layers.rain).toBe(false);
    expect(resolvedDawn.layers.rain).toBe(baseDawn.layers.rain);
  });
});
