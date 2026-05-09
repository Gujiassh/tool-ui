import { describe, expect, test } from "vitest";
import {
  getRawBaseParamsForCondition,
  mergeWithOverrides,
} from "@/app/sandbox/weather-compositor/presets";
import { mapCompositorParamsToCanvasProps } from "@/app/sandbox/weather-tuning/lib/map-to-canvas-props";
import { resolveCompositorParamsAtTime } from "@/app/sandbox/weather-tuning/lib/resolve-params";
import { createStudioTimestamp } from "@/app/sandbox/weather-tuning/lib/studio-timestamp";
import { mapToolUiPresetsToCompositor } from "@/app/sandbox/weather-tuning/lib/tool-ui-import";
import {
  resolveWeatherEffectsCanvasProps,
  TIME_CHECKPOINTS,
  type TimeCheckpoint,
  TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
} from "@/lib/weather-authoring/weather-widget/effects";
import type { WeatherConditionCode } from "@/lib/weather-authoring/weather-widget/schema";

const REFERENCE_DATE = new Date("2026-01-01T00:00:00Z");
const REPO_CHECKPOINT_OVERRIDES = mapToolUiPresetsToCompositor(
  TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
);

function resolveStudioCanvasProps(
  condition: WeatherConditionCode,
  timeOfDay: number,
) {
  const timestamp = createStudioTimestamp(timeOfDay, REFERENCE_DATE);
  const rawBaseAtTime = getRawBaseParamsForCondition(condition, timestamp);
  rawBaseAtTime.celestial.timeOfDay = timeOfDay;

  const getRawBaseForCheckpoint = (checkpoint: TimeCheckpoint) => {
    const checkpointTime = TIME_CHECKPOINTS[checkpoint];
    const checkpointTimestamp = createStudioTimestamp(
      checkpointTime,
      REFERENCE_DATE,
    );
    const base = getRawBaseParamsForCondition(condition, checkpointTimestamp);
    base.celestial.timeOfDay = checkpointTime;
    return base;
  };

  const resolved = resolveCompositorParamsAtTime({
    timeOfDay,
    rawBaseAtTime,
    getRawBaseForCheckpoint,
    repoCheckpointOverrides: REPO_CHECKPOINT_OVERRIDES[condition],
    getRepoBaseForCheckpoint: (checkpoint) =>
      mergeWithOverrides(
        getRawBaseForCheckpoint(checkpoint),
        REPO_CHECKPOINT_OVERRIDES[condition]?.[checkpoint],
      ),
    userCheckpointOverrides: undefined,
  });

  return mapCompositorParamsToCanvasProps(resolved);
}

describe("shared weather canvas resolver parity", () => {
  test.each([
    { condition: "clear" as const, timeOfDay: 0.37 },
    { condition: "cloudy" as const, timeOfDay: 0.62 },
    { condition: "rain" as const, timeOfDay: 0.88 },
  ])("matches studio preview for $condition at $timeOfDay (interpolated mode)", ({
    condition,
    timeOfDay,
  }) => {
    const timestamp = createStudioTimestamp(timeOfDay, REFERENCE_DATE);
    const shared = resolveWeatherEffectsCanvasProps({
      conditionCode: condition,
      timestamp,
      timeOfDay,
      tunedPresets: TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
      checkpointMode: "interpolated",
    });

    const studio = resolveStudioCanvasProps(condition, timeOfDay);

    expect(shared).toEqual(studio);
  });

  test("checkpoint mode changes output between keyframes", () => {
    const condition: WeatherConditionCode = "cloudy";
    const timeOfDay = 0.37;
    const timestamp = createStudioTimestamp(timeOfDay, REFERENCE_DATE);

    const nearest = resolveWeatherEffectsCanvasProps({
      conditionCode: condition,
      timestamp,
      tunedPresets: TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
      checkpointMode: "nearest",
    });

    const interpolated = resolveWeatherEffectsCanvasProps({
      conditionCode: condition,
      timestamp,
      tunedPresets: TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
      checkpointMode: "interpolated",
    });

    expect(interpolated).not.toEqual(nearest);
  });
});
