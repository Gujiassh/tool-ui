import { describe, expect, it } from "vitest";

import { listUpdatedParams } from "@/app/sandbox/weather-tuning/lib/list-updated-params";

describe("listUpdatedParams", () => {
  it("returns all updated parameter paths", () => {
    const result = listUpdatedParams({
      clear: {
        dawn: {
          glass: {
            depth: 12,
            strength: 90,
          },
          rain: {
            zoom: 1.1,
          },
        },
        noon: {},
        dusk: {},
        midnight: {},
      },
    });

    expect(result).toEqual([
      "clear.dawn.glass.depth",
      "clear.dawn.glass.strength",
      "clear.dawn.rain.zoom",
    ]);
  });

  it("returns empty for no deltas", () => {
    const result = listUpdatedParams({
      clear: { dawn: {}, noon: {}, dusk: {}, midnight: {} },
    });
    expect(result).toEqual([]);
  });
});
