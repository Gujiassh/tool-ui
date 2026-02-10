import { describe, expect, test } from "vitest";

import { TIME_CHECKPOINTS } from "@/components/tool-ui/weather-widget/effects/tuning";
import type { TimeCheckpoint } from "@/components/tool-ui/weather-widget/effects/tuning";
import type { FullCompositorParams } from "@/app/sandbox/weather-compositor/presets";
import { mergeWithOverrides } from "@/app/sandbox/weather-compositor/presets";
import type { CheckpointOverrides } from "@/app/sandbox/weather-compositor/interpolation";
import { resolveCompositorParamsAtTime } from "@/app/sandbox/weather-tuning/lib/resolve-params";

function makeBase(timeOfDay: number): FullCompositorParams {
  // Only a few fields are relevant to this test; the rest are just required for mergeWithOverrides.
  return {
    layers: {
      celestial: true,
      clouds: false,
      rain: false,
      lightning: false,
      snow: false,
    },
    celestial: {
      timeOfDay,
      moonPhase: 0.5,
      starDensity: 0.5,
      celestialX: 0.5,
      celestialY: 0.72,
      sunSize: 0.06,
      moonSize: 0.05,
      sunGlowIntensity: 1.0,
      sunGlowSize: 0.3,
      sunRayCount: 12,
      sunRayLength: 0.5,
      sunRayIntensity: 0.4,
      sunRayShimmer: 1.0,
      sunRayShimmerSpeed: 1.0,
      moonGlowIntensity: 1.0,
      moonGlowSize: 0.2,
      skyBrightness: 1.0,
      skySaturation: 1.0,
      skyContrast: 1.0,
    },
    cloud: {} as unknown as FullCompositorParams["cloud"],
    rain: {} as unknown as FullCompositorParams["rain"],
    lightning: {} as unknown as FullCompositorParams["lightning"],
    snow: {} as unknown as FullCompositorParams["snow"],
    glass: {
      enabled: true,
      depth: 3,
      strength: 75,
      chromaticAberration: 6,
      blur: 1.5,
      brightness: 0.8,
      saturation: 1.3,
    },
    post: { enabled: true } as unknown as FullCompositorParams["post"],
  };
}

function makeEmptyCheckpointOverrides(): CheckpointOverrides {
  return {
    dawn: {},
    noon: {},
    dusk: {},
    midnight: {},
  };
}

describe("resolveCompositorParamsAtTime", () => {
  test("adopting an applied delta as repo defaults preserves the resolved output", () => {
    const timeOfDay = TIME_CHECKPOINTS.midnight;

    const repo1: CheckpointOverrides = {
      ...makeEmptyCheckpointOverrides(),
      midnight: { celestial: { skyContrast: 1.0 } },
    };

    const userDelta: CheckpointOverrides = {
      ...makeEmptyCheckpointOverrides(),
      midnight: { celestial: { skyContrast: 1.04 } },
    };

    const repo2: CheckpointOverrides = {
      ...makeEmptyCheckpointOverrides(),
      midnight: { celestial: { skyContrast: 1.04 } },
    };

    const getRawBaseForCheckpoint = (cp: TimeCheckpoint) =>
      makeBase(TIME_CHECKPOINTS[cp]);

    const getRepoBaseForCheckpoint1 = (cp: TimeCheckpoint) => {
      const raw = getRawBaseForCheckpoint(cp);
      const o = repo1[cp];
      return mergeWithOverrides(raw, o);
    };

    const beforeApply = resolveCompositorParamsAtTime({
      timeOfDay,
      rawBaseAtTime: makeBase(timeOfDay),
      getRawBaseForCheckpoint,
      repoCheckpointOverrides: repo1,
      getRepoBaseForCheckpoint: getRepoBaseForCheckpoint1,
      userCheckpointOverrides: userDelta,
    });

    const getRepoBaseForCheckpoint2 = (cp: TimeCheckpoint) => {
      const raw = getRawBaseForCheckpoint(cp);
      const o = repo2[cp];
      return mergeWithOverrides(raw, o);
    };

    const afterApply = resolveCompositorParamsAtTime({
      timeOfDay,
      rawBaseAtTime: makeBase(timeOfDay),
      getRawBaseForCheckpoint,
      repoCheckpointOverrides: repo2,
      getRepoBaseForCheckpoint: getRepoBaseForCheckpoint2,
      userCheckpointOverrides: undefined,
    });

    expect(beforeApply.celestial.skyContrast).toBe(1.04);
    expect(afterApply.celestial.skyContrast).toBe(1.04);
  });

  test("repo defaults interpolate across time when only one endpoint is overridden", () => {
    // Halfway between midnight (0.0) and dawn (0.25).
    const timeOfDay = 0.125;

    const repo: CheckpointOverrides = {
      ...makeEmptyCheckpointOverrides(),
      midnight: { celestial: { skyContrast: 1.04 } },
    };

    const getRawBaseForCheckpoint = (cp: TimeCheckpoint) =>
      makeBase(TIME_CHECKPOINTS[cp]);
    const getRepoBaseForCheckpoint = (cp: TimeCheckpoint) =>
      mergeWithOverrides(getRawBaseForCheckpoint(cp), repo[cp]);

    const resolved = resolveCompositorParamsAtTime({
      timeOfDay,
      rawBaseAtTime: makeBase(timeOfDay),
      getRawBaseForCheckpoint,
      repoCheckpointOverrides: repo,
      getRepoBaseForCheckpoint,
      userCheckpointOverrides: undefined,
    });

    // Should land between base (1.0) at dawn and override (1.04) at midnight.
    expect(resolved.celestial.skyContrast).toBeGreaterThan(1.0);
    expect(resolved.celestial.skyContrast).toBeLessThan(1.04);
  });
});
