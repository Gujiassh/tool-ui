import { describe, expect, test } from "vitest";

import {
  SerializableParameterSliderSchema,
  safeParseSerializableParameterSlider,
  type SerializableParameterSlider,
} from "@/components/tool-ui/parameter-slider/schema";

function makePayload(): SerializableParameterSlider {
  return {
    id: "parameter-slider-test",
    sliders: [
      {
        id: "exposure",
        label: "Exposure",
        min: -3,
        max: 3,
        step: 0.1,
        value: 0,
        precision: 1,
      },
    ],
  };
}

describe("parameter-slider schema contract", () => {
  test("accepts unified actions payload key", () => {
    const payload = makePayload();
    payload.actions = [{ id: "apply", label: "Apply" }];

    const result = SerializableParameterSliderSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  test("rejects legacy adjustmentActions payload key", () => {
    const payload = {
      ...makePayload(),
      adjustmentActions: [{ id: "apply", label: "Apply" }],
    };

    const result = SerializableParameterSliderSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  test("rejects non-increasing ranges", () => {
    const payload = makePayload();
    payload.sliders[0] = { ...payload.sliders[0], min: 10, max: 10 };

    const result = SerializableParameterSliderSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  test("rejects values outside of min/max", () => {
    const payload = makePayload();
    payload.sliders[0] = { ...payload.sliders[0], value: 99 };

    const result = SerializableParameterSliderSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  test("rejects duplicate slider ids", () => {
    const payload = makePayload();
    payload.sliders = [
      payload.sliders[0],
      { ...payload.sliders[0], label: "Contrast", value: 1 },
    ];

    const result = SerializableParameterSliderSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  test("supports per-slider disabled state", () => {
    const payload = makePayload();
    payload.sliders[0] = { ...payload.sliders[0], disabled: true };

    const result = SerializableParameterSliderSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sliders[0]?.disabled).toBe(true);
    }
  });

  test("safe parser returns null for invalid payload", () => {
    const payload = makePayload();
    payload.sliders[0] = { ...payload.sliders[0], min: 5, max: 0 };

    expect(safeParseSerializableParameterSlider(payload)).toBeNull();
  });
});
