import type { SliderConfig, SliderValue } from "./schema";

type SliderPercentInput = {
  value: number;
  min: number;
  max: number;
};

type EasedSliderPercentInput = {
  current: number;
  target: number;
  isDragging: boolean;
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

const DRAG_EASING_FACTOR = 0.42;
const IDLE_EASING_FACTOR = 0.24;
const EASING_SNAP_THRESHOLD = 0.02;

export function sliderRangeToPercent({
  value,
  min,
  max,
}: SliderPercentInput): number {
  const range = max - min;
  if (!Number.isFinite(range) || range <= 0) return 0;
  return clampPercent(((value - min) / range) * 100);
}

export function advanceEasedSliderPercent({
  current,
  target,
  isDragging,
}: EasedSliderPercentInput): number {
  const safeCurrent = clampPercent(current);
  const safeTarget = clampPercent(target);
  const delta = safeTarget - safeCurrent;

  if (Math.abs(delta) <= EASING_SNAP_THRESHOLD) {
    return safeTarget;
  }

  const easingFactor = isDragging ? DRAG_EASING_FACTOR : IDLE_EASING_FACTOR;
  return safeCurrent + delta * easingFactor;
}

export function createSliderValueSnapshot(sliders: SliderConfig[]): SliderValue[] {
  return sliders.map((slider) => ({ id: slider.id, value: slider.value }));
}

export function createSliderSignature(sliders: SliderConfig[]): string {
  return JSON.stringify(
    sliders.map(({ id, min, max, step, value, unit, precision }) => ({
      id,
      min,
      max,
      step: step ?? 1,
      value,
      unit: unit ?? "",
      precision: precision ?? null,
    })),
  );
}
