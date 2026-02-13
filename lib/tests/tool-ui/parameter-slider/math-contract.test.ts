import { describe, expect, test } from "vitest";

import {
  advanceEasedSliderPercent,
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

  test("easing step moves toward target without overshoot", () => {
    const next = advanceEasedSliderPercent({
      current: 20,
      target: 80,
      isDragging: false,
    });

    expect(next).toBeGreaterThan(20);
    expect(next).toBeLessThan(80);
  });

  test("dragging uses a stronger easing step than idle", () => {
    const idleNext = advanceEasedSliderPercent({
      current: 20,
      target: 80,
      isDragging: false,
    });
    const dragNext = advanceEasedSliderPercent({
      current: 20,
      target: 80,
      isDragging: true,
    });

    expect(dragNext).toBeGreaterThan(idleNext);
  });

  test("easing snaps to target when close enough", () => {
    const next = advanceEasedSliderPercent({
      current: 49.99,
      target: 50,
      isDragging: false,
    });

    expect(next).toBe(50);
  });
});
