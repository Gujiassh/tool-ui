import { describe, expect, test } from "vitest";

import {
  createSliderSignature,
  sliderRangeToPercent,
} from "@/components/tool-ui/parameter-slider/math";

describe("parameter-slider math contract", () => {
  test("returns 0 percent for zero-length ranges", () => {
    expect(sliderRangeToPercent({ value: 10, min: 10, max: 10 })).toBe(0);
  });

  test("computes normalized percent for regular ranges", () => {
    expect(sliderRangeToPercent({ value: 5, min: 0, max: 10 })).toBe(50);
  });

  test("signature changes when slider defaults change", () => {
    const a = createSliderSignature([
      { id: "bass", label: "Bass", min: -10, max: 10, step: 1, value: 0 },
    ]);
    const b = createSliderSignature([
      { id: "bass", label: "Bass", min: -10, max: 10, step: 1, value: 4 },
    ]);

    expect(a).not.toBe(b);
  });
});
