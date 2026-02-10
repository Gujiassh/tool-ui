import { describe, expect, it } from "vitest";

import { safeParseSerializableApprovalCard } from "@/components/tool-ui/approval-card";
import { safeParseSerializableAudio } from "@/components/tool-ui/audio";
import { safeParseSerializableChart } from "@/components/tool-ui/chart";
import { safeParseSerializableCitation } from "@/components/tool-ui/citation";
import { safeParseSerializableCodeBlock } from "@/components/tool-ui/code-block";
import { safeParseSerializableDataTable } from "@/components/tool-ui/data-table";
import { safeParseSerializableImage } from "@/components/tool-ui/image";
import { safeParseSerializableImageGallery } from "@/components/tool-ui/image-gallery";
import { safeParseSerializableInstagramPost } from "@/components/tool-ui/instagram-post";
import { safeParseSerializableItemCarousel } from "@/components/tool-ui/item-carousel";
import { safeParseSerializableLinkPreview } from "@/components/tool-ui/link-preview";
import { safeParseSerializableLinkedInPost } from "@/components/tool-ui/linkedin-post";
import { safeParseSerializableMessageDraft } from "@/components/tool-ui/message-draft";
import { safeParseSerializableOptionList } from "@/components/tool-ui/option-list";
import { safeParseSerializableOrderSummary } from "@/components/tool-ui/order-summary";
import { safeParseSerializableParameterSlider } from "@/components/tool-ui/parameter-slider";
import { safeParseSerializablePlan } from "@/components/tool-ui/plan";
import {
  safeParseSerializablePreferencesPanel,
  safeParseSerializablePreferencesPanelReceipt,
} from "@/components/tool-ui/preferences-panel";
import { safeParseSerializableProgressTracker } from "@/components/tool-ui/progress-tracker";
import { safeParseSerializableQuestionFlow } from "@/components/tool-ui/question-flow";
import { safeParseSerializableStatsDisplay } from "@/components/tool-ui/stats-display";
import { safeParseSerializableTerminal } from "@/components/tool-ui/terminal";
import { safeParseSerializableVideo } from "@/components/tool-ui/video";
import { safeParseWeatherWidgetPayload } from "@/components/tool-ui/weather-widget";
import { safeParseSerializableXPost } from "@/components/tool-ui/x-post";

import { approvalCardPresets } from "@/lib/presets/approval-card";
import { audioPresets } from "@/lib/presets/audio";
import { chartPresets } from "@/lib/presets/chart";
import { citationPresets } from "@/lib/presets/citation";
import { codeBlockPresets } from "@/lib/presets/code-block";
import { dataTablePresets } from "@/lib/presets/data-table";
import { imagePresets } from "@/lib/presets/image";
import { imageGalleryPresets } from "@/lib/presets/image-gallery";
import { instagramPostPresets } from "@/lib/presets/instagram-post";
import { itemCarouselPresets } from "@/lib/presets/item-carousel";
import { linkPreviewPresets } from "@/lib/presets/link-preview";
import { linkedInPostPresets } from "@/lib/presets/linkedin-post";
import { messageDraftPresets } from "@/lib/presets/message-draft";
import { optionListPresets } from "@/lib/presets/option-list";
import { orderSummaryPresets } from "@/lib/presets/order-summary";
import { parameterSliderPresets } from "@/lib/presets/parameter-slider";
import { planPresets } from "@/lib/presets/plan";
import { preferencesPanelPresets } from "@/lib/presets/preferences-panel";
import { progressTrackerPresets } from "@/lib/presets/progress-tracker";
import { questionFlowPresets } from "@/lib/presets/question-flow";
import { statsDisplayPresets } from "@/lib/presets/stats-display";
import { terminalPresets } from "@/lib/presets/terminal";
import { videoPresets } from "@/lib/presets/video";
import { weatherWidgetPresets } from "@/lib/presets/weather-widget";
import { xPostPresets } from "@/lib/presets/x-post";
import {
  resolveStreamingToolRenderState,
  type SafeParser,
} from "@/components/tool-ui/shared/streaming-render";

function firstPresetData(presets: Record<string, { data: unknown }>): unknown {
  return Object.values(presets)[0]!.data;
}

const RUNNING_STATUS = { type: "running" } as const;
const COMPLETE_STATUS = { type: "complete" } as const;
const CANCELLED_STATUS = { type: "incomplete", reason: "cancelled" } as const;

const parserCases: Array<{
  name: string;
  parse: SafeParser<unknown>;
  valid: unknown;
}> = [
  {
    name: "approval-card",
    parse: safeParseSerializableApprovalCard as SafeParser<unknown>,
    valid: approvalCardPresets.deploy.data,
  },
  {
    name: "audio",
    parse: safeParseSerializableAudio as SafeParser<unknown>,
    valid: audioPresets.full.data.audio,
  },
  {
    name: "chart",
    parse: safeParseSerializableChart as SafeParser<unknown>,
    valid: {
      id: "chart-streaming-test",
      ...chartPresets.revenue.data,
    },
  },
  {
    name: "citation",
    parse: safeParseSerializableCitation as SafeParser<unknown>,
    valid: citationPresets.inline.data.citations[0],
  },
  {
    name: "code-block",
    parse: safeParseSerializableCodeBlock as SafeParser<unknown>,
    valid: codeBlockPresets.typescript.data,
  },
  {
    name: "data-table",
    parse: safeParseSerializableDataTable as SafeParser<unknown>,
    valid: dataTablePresets.stocks.data,
  },
  {
    name: "image",
    parse: safeParseSerializableImage as SafeParser<unknown>,
    valid: imagePresets.basic.data.image,
  },
  {
    name: "image-gallery",
    parse: safeParseSerializableImageGallery as SafeParser<unknown>,
    valid: firstPresetData(imageGalleryPresets),
  },
  {
    name: "instagram-post",
    parse: safeParseSerializableInstagramPost as SafeParser<unknown>,
    valid: instagramPostPresets.basic.data.post,
  },
  {
    name: "item-carousel",
    parse: safeParseSerializableItemCarousel as SafeParser<unknown>,
    valid: firstPresetData(itemCarouselPresets),
  },
  {
    name: "link-preview",
    parse: safeParseSerializableLinkPreview as SafeParser<unknown>,
    valid: linkPreviewPresets.basic.data.linkPreview,
  },
  {
    name: "linkedin-post",
    parse: safeParseSerializableLinkedInPost as SafeParser<unknown>,
    valid: linkedInPostPresets.basic.data.post,
  },
  {
    name: "message-draft",
    parse: safeParseSerializableMessageDraft as SafeParser<unknown>,
    valid: firstPresetData(messageDraftPresets),
  },
  {
    name: "option-list",
    parse: safeParseSerializableOptionList as SafeParser<unknown>,
    valid: firstPresetData(optionListPresets),
  },
  {
    name: "order-summary",
    parse: safeParseSerializableOrderSummary as SafeParser<unknown>,
    valid: firstPresetData(orderSummaryPresets),
  },
  {
    name: "parameter-slider",
    parse: safeParseSerializableParameterSlider as SafeParser<unknown>,
    valid: firstPresetData(parameterSliderPresets),
  },
  {
    name: "plan",
    parse: safeParseSerializablePlan as SafeParser<unknown>,
    valid: planPresets.simple.data,
  },
  {
    name: "preferences-panel",
    parse: safeParseSerializablePreferencesPanel as SafeParser<unknown>,
    valid: preferencesPanelPresets.notifications.data,
  },
  {
    name: "preferences-panel-receipt",
    parse: safeParseSerializablePreferencesPanelReceipt as SafeParser<unknown>,
    valid: preferencesPanelPresets.receipt.data,
  },
  {
    name: "progress-tracker",
    parse: safeParseSerializableProgressTracker as SafeParser<unknown>,
    valid: firstPresetData(progressTrackerPresets),
  },
  {
    name: "question-flow",
    parse: safeParseSerializableQuestionFlow as SafeParser<unknown>,
    valid: firstPresetData(questionFlowPresets),
  },
  {
    name: "stats-display",
    parse: safeParseSerializableStatsDisplay as SafeParser<unknown>,
    valid: statsDisplayPresets["business-metrics"].data,
  },
  {
    name: "terminal",
    parse: safeParseSerializableTerminal as SafeParser<unknown>,
    valid: terminalPresets.success.data,
  },
  {
    name: "video",
    parse: safeParseSerializableVideo as SafeParser<unknown>,
    valid: videoPresets.basic.data.video,
  },
  {
    name: "weather-widget",
    parse: safeParseWeatherWidgetPayload as SafeParser<unknown>,
    valid: weatherWidgetPresets.thunderstorm.data,
  },
  {
    name: "x-post",
    parse: safeParseSerializableXPost as SafeParser<unknown>,
    valid: xPostPresets.basic.data.post,
  },
];

describe("resolveStreamingToolRenderState", () => {
  it("returns loading for running + invalid partial payload", () => {
    const state = resolveStreamingToolRenderState({
      status: RUNNING_STATUS,
      result: {},
      safeParseResult: safeParseSerializableLinkPreview,
      loadingMessage: "Loading preview…",
    });

    expect(state.kind).toBe("loading");
    if (state.kind !== "loading") {
      throw new Error(`Expected loading state, got ${state.kind}`);
    }
    expect(state.message).toBe("Loading preview…");
  });

  it("returns partial for running + valid parsed payload", () => {
    const state = resolveStreamingToolRenderState({
      status: RUNNING_STATUS,
      result: linkPreviewPresets.basic.data.linkPreview,
      safeParseResult: safeParseSerializableLinkPreview,
    });

    expect(state.kind).toBe("partial");
  });

  it("returns ready for complete + valid parsed payload", () => {
    const state = resolveStreamingToolRenderState({
      status: COMPLETE_STATUS,
      result: linkPreviewPresets.basic.data.linkPreview,
      safeParseResult: safeParseSerializableLinkPreview,
    });

    expect(state.kind).toBe("ready");
  });

  it("returns unavailable error for complete + invalid payload", () => {
    const state = resolveStreamingToolRenderState({
      status: COMPLETE_STATUS,
      result: {},
      safeParseResult: safeParseSerializableLinkPreview,
      unavailableMessage: "Preview unavailable",
    });

    expect(state.kind).toBe("error");
    if (state.kind !== "error") {
      throw new Error(`Expected error state, got ${state.kind}`);
    }
    expect(state.message).toBe("Preview unavailable");
  });

  it("returns cancelled error for incomplete/cancelled", () => {
    const state = resolveStreamingToolRenderState({
      status: CANCELLED_STATUS,
      result: {},
      safeParseResult: safeParseSerializableLinkPreview,
      cancelledMessage: "Cancelled by user",
    });

    expect(state.kind).toBe("error");
    if (state.kind !== "error") {
      throw new Error(`Expected error state, got ${state.kind}`);
    }
    expect(state.isCancelled).toBe(true);
    expect(state.message).toBe("Cancelled by user");
  });
});

describe("tool-ui parser parity (streaming lifecycle)", () => {
  for (const testCase of parserCases) {
    it(`${testCase.name}: loading -> partial -> ready`, () => {
      const loading = resolveStreamingToolRenderState({
        status: RUNNING_STATUS,
        result: {},
        safeParseResult: testCase.parse,
      });
      expect(loading.kind).toBe("loading");

      const partial = resolveStreamingToolRenderState({
        status: RUNNING_STATUS,
        result: testCase.valid,
        safeParseResult: testCase.parse,
      });
      expect(partial.kind).toBe("partial");

      const ready = resolveStreamingToolRenderState({
        status: COMPLETE_STATUS,
        result: testCase.valid,
        safeParseResult: testCase.parse,
      });
      expect(ready.kind).toBe("ready");
    });
  }
});
