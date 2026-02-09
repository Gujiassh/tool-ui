import { describe, expect, test } from "vitest";

import { mergeTunedPresets, toToolUiDelta } from "@/app/sandbox/weather-tuning/lib/tool-ui-export";

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
});

