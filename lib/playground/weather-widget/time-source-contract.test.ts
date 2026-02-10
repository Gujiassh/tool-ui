import { describe, expect, test } from "vitest";

import { resolveWeatherVisualTime } from "@/components/tool-ui/weather-widget/time";

describe("weather-widget visual time precedence", () => {
  test("prefers visual.timeBucket over localTimeOfDay and updatedAt", () => {
    const resolved = resolveWeatherVisualTime({
      visual: {
        timeBucket: 2,
        localTimeOfDay: 0.9,
      },
      updatedAt: "2026-01-01T23:59:00Z",
    });

    expect(resolved.source).toBe("timeBucket");
    expect(resolved.timeOfDay).toBeCloseTo((2 + 0.5) / 12, 6);
  });

  test("uses visual.localTimeOfDay when no timeBucket is provided", () => {
    const resolved = resolveWeatherVisualTime({
      visual: {
        localTimeOfDay: 0.37,
      },
      updatedAt: "2026-01-01T23:59:00Z",
    });

    expect(resolved.source).toBe("localTimeOfDay");
    expect(resolved.timeOfDay).toBeCloseTo(0.37, 6);
  });

  test("falls back to updatedAt when visual is missing", () => {
    const resolved = resolveWeatherVisualTime({
      updatedAt: "2026-01-01T18:00:00Z",
    });

    expect(resolved.source).toBe("updatedAt");
    expect(resolved.timeOfDay).toBeCloseTo(0.75, 6);
  });

  test("defaults to noon when no visual time is available", () => {
    const resolved = resolveWeatherVisualTime({});

    expect(resolved.source).toBe("defaultNoon");
    expect(resolved.timeOfDay).toBe(0.5);
  });
});
