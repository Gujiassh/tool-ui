import { describe, expect, it } from "vitest";
import { parseSerializableOptionList } from "@/components/tool-ui/option-list/schema";
import { parseSerializableParameterSlider } from "@/components/tool-ui/parameter-slider/schema";
import { parseSerializablePreferencesPanel } from "@/components/tool-ui/preferences-panel/schema";

describe("outlier action prop migration contracts", () => {
  it("rejects legacy selectionActions on OptionList payloads", () => {
    expect(() =>
      parseSerializableOptionList({
        id: "option-list-contract",
        options: [{ id: "one", label: "One" }],
        selectionActions: [{ id: "confirm", label: "Confirm" }],
      }),
    ).toThrow();
  });

  it("rejects legacy responseActions on OptionList payloads", () => {
    expect(() =>
      parseSerializableOptionList({
        id: "option-list-contract",
        options: [{ id: "one", label: "One" }],
        responseActions: [{ id: "confirm", label: "Confirm" }],
      }),
    ).toThrow();
  });

  it("rejects legacy adjustmentActions on ParameterSlider payloads", () => {
    expect(() =>
      parseSerializableParameterSlider({
        id: "parameter-slider-contract",
        sliders: [{ id: "gain", label: "Gain", min: 0, max: 10, value: 5 }],
        adjustmentActions: [{ id: "apply", label: "Apply" }],
      }),
    ).toThrow();
  });

  it("rejects legacy responseActions on ParameterSlider payloads", () => {
    expect(() =>
      parseSerializableParameterSlider({
        id: "parameter-slider-contract",
        sliders: [{ id: "gain", label: "Gain", min: 0, max: 10, value: 5 }],
        responseActions: [{ id: "apply", label: "Apply" }],
      }),
    ).toThrow();
  });

  it("rejects legacy formActions on PreferencesPanel payloads", () => {
    expect(() =>
      parseSerializablePreferencesPanel({
        id: "preferences-panel-contract",
        sections: [
          {
            items: [{ id: "email", label: "Email", type: "switch" }],
          },
        ],
        formActions: [{ id: "save", label: "Save" }],
      }),
    ).toThrow();
  });

  it("rejects legacy responseActions on PreferencesPanel payloads", () => {
    expect(() =>
      parseSerializablePreferencesPanel({
        id: "preferences-panel-contract",
        sections: [
          {
            items: [{ id: "email", label: "Email", type: "switch" }],
          },
        ],
        responseActions: [{ id: "save", label: "Save" }],
      }),
    ).toThrow();
  });
});
