import { describe, expect, it } from "vitest";

import {
  getPreviewConfig,
  STREAMING_PRESET_NAME,
  type ComponentId,
} from "@/lib/docs/preview-config";

const COMPONENT_IDS: ComponentId[] = [
  "approval-card",
  "chart",
  "citation",
  "code-block",
  "data-table",
  "image",
  "image-gallery",
  "video",
  "audio",
  "link-preview",
  "message-draft",
  "item-carousel",
  "option-list",
  "order-summary",
  "parameter-slider",
  "plan",
  "preferences-panel",
  "progress-tracker",
  "stats-display",
  "terminal",
  "question-flow",
  "weather-widget",
];

describe("component preview streaming preset", () => {
  it("registers a streaming-state preset for every component preview", () => {
    for (const componentId of COMPONENT_IDS) {
      const config = getPreviewConfig(componentId);
      const preset = config.presets[STREAMING_PRESET_NAME];

      expect(
        preset,
        `${componentId} is missing ${STREAMING_PRESET_NAME} preset`,
      ).toBeDefined();
      expect(
        preset?.description,
        `${componentId} streaming preset should include description`,
      ).toContain("loading");
    }
  });

  it("generates streaming preset code snippets that reference ToolRenderState", () => {
    const config = getPreviewConfig("link-preview");
    const preset = config.presets[STREAMING_PRESET_NAME];
    const code = preset.generateExampleCode(preset.data);

    expect(code).toContain("ToolRenderState");
    expect(code).toContain("resolveStreamingToolRenderState");
  });
});
