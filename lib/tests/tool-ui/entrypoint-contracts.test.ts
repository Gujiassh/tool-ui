import { describe, expect, it } from "vitest";

import * as ApprovalCardUi from "@/components/tool-ui/approval-card";
import * as ApprovalCardSchema from "@/components/tool-ui/approval-card/schema";
import * as AudioUi from "@/components/tool-ui/audio";
import * as AudioSchema from "@/components/tool-ui/audio/schema";
import * as ChartUi from "@/components/tool-ui/chart";
import * as ChartSchema from "@/components/tool-ui/chart/schema";
import * as CitationUi from "@/components/tool-ui/citation";
import * as CitationSchema from "@/components/tool-ui/citation/schema";
import * as CodeBlockUi from "@/components/tool-ui/code-block";
import * as CodeBlockSchema from "@/components/tool-ui/code-block/schema";
import * as ImageUi from "@/components/tool-ui/image";
import * as ImageSchema from "@/components/tool-ui/image/schema";
import * as ImageGalleryUi from "@/components/tool-ui/image-gallery";
import * as ImageGallerySchema from "@/components/tool-ui/image-gallery/schema";
import * as InstagramPostUi from "@/components/tool-ui/instagram-post";
import * as InstagramPostSchema from "@/components/tool-ui/instagram-post/schema";
import * as ItemCarouselUi from "@/components/tool-ui/item-carousel";
import * as ItemCarouselSchema from "@/components/tool-ui/item-carousel/schema";
import * as LinkPreviewUi from "@/components/tool-ui/link-preview";
import * as LinkPreviewSchema from "@/components/tool-ui/link-preview/schema";
import * as LinkedInPostUi from "@/components/tool-ui/linkedin-post";
import * as LinkedInPostSchema from "@/components/tool-ui/linkedin-post/schema";
import * as MessageDraftUi from "@/components/tool-ui/message-draft";
import * as MessageDraftSchema from "@/components/tool-ui/message-draft/schema";
import * as OptionListUi from "@/components/tool-ui/option-list";
import * as OptionListSchema from "@/components/tool-ui/option-list/schema";
import * as OrderSummaryUi from "@/components/tool-ui/order-summary";
import * as OrderSummarySchema from "@/components/tool-ui/order-summary/schema";
import * as ParameterSliderUi from "@/components/tool-ui/parameter-slider";
import * as ParameterSliderSchema from "@/components/tool-ui/parameter-slider/schema";
import * as PlanUi from "@/components/tool-ui/plan";
import * as PlanSchema from "@/components/tool-ui/plan/schema";
import * as PreferencesPanelUi from "@/components/tool-ui/preferences-panel";
import * as PreferencesPanelSchema from "@/components/tool-ui/preferences-panel/schema";
import * as ProgressTrackerUi from "@/components/tool-ui/progress-tracker";
import * as ProgressTrackerSchema from "@/components/tool-ui/progress-tracker/schema";
import * as QuestionFlowUi from "@/components/tool-ui/question-flow";
import * as QuestionFlowSchema from "@/components/tool-ui/question-flow/schema";
import * as StatsDisplayUi from "@/components/tool-ui/stats-display";
import * as StatsDisplaySchema from "@/components/tool-ui/stats-display/schema";
import * as TerminalUi from "@/components/tool-ui/terminal";
import * as TerminalSchema from "@/components/tool-ui/terminal/schema";
import * as VideoUi from "@/components/tool-ui/video";
import * as VideoSchema from "@/components/tool-ui/video/schema";
import * as WeatherWidgetUi from "@/lib/weather-authoring/weather-widget";
import * as WeatherWidgetSchema from "@/lib/weather-authoring/weather-widget/schema";
import * as XPostUi from "@/components/tool-ui/x-post";
import * as XPostSchema from "@/components/tool-ui/x-post/schema";

type EntrypointContractCase = {
  name: string;
  uiEntrypoint: Record<string, unknown>;
  schemaEntrypoint: Record<string, unknown>;
  helperNames: string[];
};

const contractCases: EntrypointContractCase[] = [
  {
    name: "approval-card",
    uiEntrypoint: ApprovalCardUi,
    schemaEntrypoint: ApprovalCardSchema,
    helperNames: [
      "SerializableApprovalCardSchema",
      "parseSerializableApprovalCard",
      "safeParseSerializableApprovalCard",
    ],
  },
  {
    name: "audio",
    uiEntrypoint: AudioUi,
    schemaEntrypoint: AudioSchema,
    helperNames: [
      "SerializableAudioSchema",
      "parseSerializableAudio",
      "safeParseSerializableAudio",
    ],
  },
  {
    name: "chart",
    uiEntrypoint: ChartUi,
    schemaEntrypoint: ChartSchema,
    helperNames: [
      "ChartPropsSchema",
      "ChartSeriesSchema",
      "SerializableChartSchema",
      "parseSerializableChart",
      "safeParseSerializableChart",
    ],
  },
  {
    name: "citation",
    uiEntrypoint: CitationUi,
    schemaEntrypoint: CitationSchema,
    helperNames: [
      "SerializableCitationSchema",
      "CitationTypeSchema",
      "CitationVariantSchema",
      "parseSerializableCitation",
      "safeParseSerializableCitation",
    ],
  },
  {
    name: "code-block",
    uiEntrypoint: CodeBlockUi,
    schemaEntrypoint: CodeBlockSchema,
    helperNames: [
      "CodeBlockPropsSchema",
      "SerializableCodeBlockSchema",
      "parseSerializableCodeBlock",
      "safeParseSerializableCodeBlock",
    ],
  },
  {
    name: "image",
    uiEntrypoint: ImageUi,
    schemaEntrypoint: ImageSchema,
    helperNames: [
      "SerializableImageSchema",
      "parseSerializableImage",
      "safeParseSerializableImage",
    ],
  },
  {
    name: "image-gallery",
    uiEntrypoint: ImageGalleryUi,
    schemaEntrypoint: ImageGallerySchema,
    helperNames: [
      "SerializableImageGallerySchema",
      "ImageGalleryItemSchema",
      "parseSerializableImageGallery",
      "safeParseSerializableImageGallery",
    ],
  },
  {
    name: "instagram-post",
    uiEntrypoint: InstagramPostUi,
    schemaEntrypoint: InstagramPostSchema,
    helperNames: [
      "SerializableInstagramPostSchema",
      "parseSerializableInstagramPost",
      "safeParseSerializableInstagramPost",
    ],
  },
  {
    name: "item-carousel",
    uiEntrypoint: ItemCarouselUi,
    schemaEntrypoint: ItemCarouselSchema,
    helperNames: [
      "ItemSchema",
      "ItemCarouselPropsSchema",
      "SerializableItemSchema",
      "SerializableItemCarouselSchema",
      "parseSerializableItemCarousel",
      "safeParseSerializableItemCarousel",
    ],
  },
  {
    name: "link-preview",
    uiEntrypoint: LinkPreviewUi,
    schemaEntrypoint: LinkPreviewSchema,
    helperNames: [
      "SerializableLinkPreviewSchema",
      "parseSerializableLinkPreview",
      "safeParseSerializableLinkPreview",
    ],
  },
  {
    name: "linkedin-post",
    uiEntrypoint: LinkedInPostUi,
    schemaEntrypoint: LinkedInPostSchema,
    helperNames: [
      "SerializableLinkedInPostSchema",
      "parseSerializableLinkedInPost",
      "safeParseSerializableLinkedInPost",
    ],
  },
  {
    name: "message-draft",
    uiEntrypoint: MessageDraftUi,
    schemaEntrypoint: MessageDraftSchema,
    helperNames: [
      "SerializableMessageDraftSchema",
      "SerializableEmailDraftSchema",
      "SerializableSlackDraftSchema",
      "MessageDraftChannelSchema",
      "MessageDraftOutcomeSchema",
      "parseSerializableMessageDraft",
      "safeParseSerializableMessageDraft",
    ],
  },
  {
    name: "option-list",
    uiEntrypoint: OptionListUi,
    schemaEntrypoint: OptionListSchema,
    helperNames: [
      "OptionListOptionSchema",
      "OptionListPropsSchema",
      "SerializableOptionListSchema",
      "parseSerializableOptionList",
      "safeParseSerializableOptionList",
    ],
  },
  {
    name: "order-summary",
    uiEntrypoint: OrderSummaryUi,
    schemaEntrypoint: OrderSummarySchema,
    helperNames: [
      "SerializableOrderSummarySchema",
      "OrderItemSchema",
      "PricingSchema",
      "OrderDecisionSchema",
      "parseSerializableOrderSummary",
      "safeParseSerializableOrderSummary",
    ],
  },
  {
    name: "parameter-slider",
    uiEntrypoint: ParameterSliderUi,
    schemaEntrypoint: ParameterSliderSchema,
    helperNames: [
      "SliderConfigSchema",
      "SerializableParameterSliderSchema",
      "parseSerializableParameterSlider",
      "safeParseSerializableParameterSlider",
    ],
  },
  {
    name: "plan",
    uiEntrypoint: PlanUi,
    schemaEntrypoint: PlanSchema,
    helperNames: [
      "parseSerializablePlan",
      "safeParseSerializablePlan",
      "PlanPropsSchema",
      "PlanTodoSchema",
      "PlanTodoStatusSchema",
      "SerializablePlanSchema",
    ],
  },
  {
    name: "preferences-panel",
    uiEntrypoint: PreferencesPanelUi,
    schemaEntrypoint: PreferencesPanelSchema,
    helperNames: [
      "SerializablePreferencesPanelSchema",
      "SerializablePreferencesPanelReceiptSchema",
      "parseSerializablePreferencesPanel",
      "safeParseSerializablePreferencesPanel",
      "parseSerializablePreferencesPanelReceipt",
      "safeParseSerializablePreferencesPanelReceipt",
    ],
  },
  {
    name: "progress-tracker",
    uiEntrypoint: ProgressTrackerUi,
    schemaEntrypoint: ProgressTrackerSchema,
    helperNames: [
      "SerializableProgressTrackerSchema",
      "parseSerializableProgressTracker",
      "safeParseSerializableProgressTracker",
      "ProgressStepSchema",
    ],
  },
  {
    name: "question-flow",
    uiEntrypoint: QuestionFlowUi,
    schemaEntrypoint: QuestionFlowSchema,
    helperNames: [
      "SerializableQuestionFlowSchema",
      "SerializableProgressiveModeSchema",
      "SerializableUpfrontModeSchema",
      "SerializableReceiptModeSchema",
      "QuestionFlowOptionSchema",
      "QuestionFlowStepDefinitionSchema",
      "QuestionFlowChoiceSchema",
      "QuestionFlowSummaryItemSchema",
      "parseSerializableQuestionFlow",
      "safeParseSerializableQuestionFlow",
    ],
  },
  {
    name: "stats-display",
    uiEntrypoint: StatsDisplayUi,
    schemaEntrypoint: StatsDisplaySchema,
    helperNames: [
      "SerializableStatsDisplaySchema",
      "parseSerializableStatsDisplay",
      "safeParseSerializableStatsDisplay",
      "StatFormatSchema",
      "StatDiffSchema",
      "StatSparklineSchema",
      "StatItemSchema",
    ],
  },
  {
    name: "terminal",
    uiEntrypoint: TerminalUi,
    schemaEntrypoint: TerminalSchema,
    helperNames: [
      "TerminalPropsSchema",
      "SerializableTerminalSchema",
      "parseSerializableTerminal",
      "safeParseSerializableTerminal",
    ],
  },
  {
    name: "video",
    uiEntrypoint: VideoUi,
    schemaEntrypoint: VideoSchema,
    helperNames: [
      "SerializableVideoSchema",
      "parseSerializableVideo",
      "safeParseSerializableVideo",
    ],
  },
  {
    name: "weather-widget",
    uiEntrypoint: WeatherWidgetUi,
    schemaEntrypoint: WeatherWidgetSchema,
    helperNames: [
      "WeatherWidgetPayloadSchema",
      "parseWeatherWidgetPayload",
      "safeParseWeatherWidgetPayload",
      "WeatherConditionCodeSchema",
      "ForecastDaySchema",
      "TemperatureUnitSchema",
      "TimeBucketSchema",
      "PrecipitationLevelSchema",
    ],
  },
  {
    name: "x-post",
    uiEntrypoint: XPostUi,
    schemaEntrypoint: XPostSchema,
    helperNames: [
      "SerializableXPostSchema",
      "parseSerializableXPost",
      "safeParseSerializableXPost",
    ],
  },
];

describe("tool-ui entrypoint contracts", () => {
  for (const componentCase of contractCases) {
    describe(componentCase.name, () => {
      it("keeps schema helpers off the main UI entrypoint", () => {
        for (const helperName of componentCase.helperNames) {
          expect(componentCase.uiEntrypoint).not.toHaveProperty(helperName);
        }
      });

      it("exposes schema helpers from the /schema entrypoint", () => {
        for (const helperName of componentCase.helperNames) {
          expect(componentCase.schemaEntrypoint).toHaveProperty(helperName);
        }
      });
    });
  }
});
