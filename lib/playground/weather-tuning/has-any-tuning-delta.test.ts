import { describe, expect, it } from "vitest";

import { hasAnyTuningDelta } from "@/app/sandbox/weather-tuning/lib/has-any-tuning-delta";

describe("hasAnyTuningDelta", () => {
  it("returns false for empty overrides", () => {
    expect(hasAnyTuningDelta({})).toBe(false);
    expect(
      hasAnyTuningDelta({
        clear: { dawn: {}, noon: {}, dusk: {}, midnight: {} },
      }),
    ).toBe(false);
  });

  it("returns true when any checkpoint contains override groups", () => {
    expect(
      hasAnyTuningDelta({
        clear: {
          dawn: { glass: { depth: 8 } },
          noon: {},
          dusk: {},
          midnight: {},
        },
      }),
    ).toBe(true);
  });
});
