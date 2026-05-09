import { describe, expect, test } from "vitest";
import {
  type CheckpointOverrides,
  getRawBaseParamsForCondition,
} from "@/app/sandbox/weather-compositor/presets";
import { createStudioTimestamp } from "@/app/sandbox/weather-tuning/lib/studio-timestamp";
import {
  buildCanonicalToolUiPresetsForEditedConditions,
  mergeTunedPresets,
  replaceEditedConditions,
  toToolUiDelta,
} from "@/app/sandbox/weather-tuning/lib/tool-ui-export";
import { mapToolUiPresetsToCompositor } from "@/app/sandbox/weather-tuning/lib/tool-ui-import";

describe("weather-tuning tool-ui export", () => {
  test("mergeTunedPresets preserves untouched conditions", () => {
    const base = {
      drizzle: {
        dawn: { rain: { glassIntensity: 0.2 } },
        noon: {},
        dusk: {},
        midnight: {},
      },
      clear: {
        dawn: { celestial: { starDensity: 0.1, moonPhase: 0.25 } },
        noon: {},
        dusk: {},
        midnight: {},
      },
    } as const;

    const delta = {
      clear: {
        dawn: { celestial: { starDensity: 0.5 } },
        noon: {},
        dusk: {},
        midnight: {},
      },
    } as const;

    const merged = mergeTunedPresets(base, delta);

    // Unrelated condition remains.
    expect(merged.drizzle?.dawn.rain?.glassIntensity).toBe(0.2);

    // Deep merge within a group: updated field overrides, untouched field remains.
    expect(merged.clear?.dawn.celestial?.starDensity).toBe(0.5);
    expect(merged.clear?.dawn.celestial?.moonPhase).toBe(0.25);
  });

  test("toToolUiDelta maps rain.zoom -> rain.glassZoom", () => {
    const delta = toToolUiDelta({
      clear: {
        dawn: {},
        noon: {
          rain: {
            zoom: 0.75,
          },
        },
        dusk: {},
        midnight: {},
      },
    });

    expect(delta.clear?.noon.rain?.glassZoom).toBe(0.75);
  });

  test("canonical export replaces edited condition output and removes stale keys", () => {
    const base = {
      clear: {
        dawn: {},
        noon: {
          celestial: {
            moonPhase: 0.1234,
            starDensity: 0.4,
          },
        },
        dusk: {},
        midnight: {},
      },
      rain: {
        dawn: { rain: { glassIntensity: 0.8 } },
        noon: {},
        dusk: {},
        midnight: {},
      },
    } as const;

    const repoCheckpointOverrides = mapToolUiPresetsToCompositor(base);

    const rawNoon = getRawBaseParamsForCondition(
      "clear",
      createStudioTimestamp(0.5, new Date("2026-01-01T00:00:00Z")),
    );

    const editedConditionOverrides: Partial<
      Record<"clear", CheckpointOverrides>
    > = {
      clear: {
        dawn: {},
        noon: {
          celestial: {
            // Revert this parameter to raw-base value, which should delete
            // the previously exported moonPhase override.
            moonPhase: rawNoon.celestial.moonPhase,
            // Keep this as an intentional override.
            starDensity: 0.7,
          },
        },
        dusk: {},
        midnight: {},
      },
    };

    const canonical = buildCanonicalToolUiPresetsForEditedConditions(
      editedConditionOverrides,
      repoCheckpointOverrides,
    );
    const replaced = replaceEditedConditions(base, canonical);

    expect(replaced.clear?.noon.celestial?.moonPhase).toBeUndefined();
    expect(replaced.clear?.noon.celestial?.starDensity).toBe(0.7);
    expect(replaced.rain?.dawn.rain?.glassIntensity).toBe(0.8);
  });
});
