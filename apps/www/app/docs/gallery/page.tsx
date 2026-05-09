import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import {
  GalleryPageAnalytics,
  GalleryPreviewImpression,
} from "@/app/docs/_components/gallery-analytics.client";
import { GalleryCardHeader } from "@/app/docs/_components/gallery-card-header";
import { DataTable } from "@/components/tool-ui/data-table";
import { ItemCarousel } from "@/components/tool-ui/item-carousel";
import { OrderSummary } from "@/components/tool-ui/order-summary";
import { StatsDisplay } from "@/components/tool-ui/stats-display";
import { type GalleryComponentDocId } from "@/lib/docs/gallery-component-docs";
import {
  GALLERY_COLUMN_STACK_CLASS,
  GALLERY_DESKTOP_GRID_CLASS,
  GALLERY_LAYOUT_CLASS,
  GALLERY_MOBILE_STACK_CLASS,
  GALLERY_STANDARD_PREVIEW_WRAPPER_CLASS,
} from "@/lib/docs/gallery-layout";
import { approvalCardPresets } from "@/lib/presets/approval-card";
import { audioPresets } from "@/lib/presets/audio";
import { chartPresets } from "@/lib/presets/chart";
import { citationPresets } from "@/lib/presets/citation";
import { codeBlockPresets } from "@/lib/presets/code-block";
import { codeDiffPresets } from "@/lib/presets/code-diff";
import { dataTablePresets } from "@/lib/presets/data-table";
import { geoMapPresets } from "@/lib/presets/geo-map";
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
import { weatherWidgetPresets } from "@/lib/presets/weather-widget";
import { xPostPresets } from "@/lib/presets/x-post";
import { cn } from "@/lib/ui/cn";

const ApprovalCard = dynamic(() =>
  import("@/components/tool-ui/approval-card").then((m) => m.ApprovalCard),
);
const CitationList = dynamic(() =>
  import("@/components/tool-ui/citation").then((m) => m.CitationList),
);
const ImageGallery = dynamic(() =>
  import("@/components/tool-ui/image-gallery").then((m) => m.ImageGallery),
);
const Audio = dynamic(() =>
  import("@/components/tool-ui/audio").then((m) => m.Audio),
);
const LinkPreview = dynamic(() =>
  import("@/components/tool-ui/link-preview").then((m) => m.LinkPreview),
);
const LinkedInPost = dynamic(() =>
  import("@/components/tool-ui/linkedin-post").then((m) => m.LinkedInPost),
);
const InstagramPost = dynamic(() =>
  import("@/components/tool-ui/instagram-post").then((m) => m.InstagramPost),
);
const OptionList = dynamic(() =>
  import("@/components/tool-ui/option-list").then((m) => m.OptionList),
);
const ParameterSlider = dynamic(() =>
  import("@/components/tool-ui/parameter-slider").then(
    (m) => m.ParameterSlider,
  ),
);
const Plan = dynamic(() =>
  import("@/components/tool-ui/plan").then((m) => m.Plan),
);
const Terminal = dynamic(() =>
  import("@/components/tool-ui/terminal").then((m) => m.Terminal),
);
const CodeBlock = dynamic(() =>
  import("@/components/tool-ui/code-block").then((m) => m.CodeBlock),
);
const CodeDiff = dynamic(() =>
  import("@/components/tool-ui/code-diff").then((m) => m.CodeDiff),
);
const Chart = dynamic(() =>
  import("@/components/tool-ui/chart").then((m) => m.Chart),
);
const GeoMap = dynamic(() =>
  import("@/components/tool-ui/geo-map").then((m) => m.GeoMap),
);
const PreferencesPanel = dynamic(() =>
  import("@/components/tool-ui/preferences-panel").then(
    (m) => m.PreferencesPanel,
  ),
);
const ProgressTracker = dynamic(() =>
  import("@/components/tool-ui/progress-tracker").then(
    (m) => m.ProgressTracker,
  ),
);
const QuestionFlow = dynamic(() =>
  import("@/components/tool-ui/question-flow").then((m) => m.QuestionFlow),
);
const MessageDraft = dynamic(() =>
  import("@/components/tool-ui/message-draft").then((m) => m.MessageDraft),
);
const XPost = dynamic(() =>
  import("@/components/tool-ui/x-post").then((m) => m.XPost),
);
const WeatherWidget = dynamic(() =>
  import("@/components/tool-ui/weather-widget/runtime").then(
    (m) => m.WeatherWidget,
  ),
);

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse all Tool UI components in a visual gallery",
};

export const revalidate = 3600;

interface GalleryPreviewCardProps {
  componentId: GalleryComponentDocId;
  className?: string;
  children: ReactNode;
}

interface GalleryCardConfig {
  componentId: GalleryComponentDocId;
  className: string;
  render: () => ReactNode;
}

function GalleryPreviewCard({
  componentId,
  className,
  children,
}: GalleryPreviewCardProps) {
  return (
    <article
      className={cn(
        "group/gallery-card relative flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden rounded-xl border border-border/40 bg-card p-4 pb-6 transition-colors focus-within:border-border/70 hover:border-border/70",
        className,
      )}
    >
      <GalleryPreviewImpression componentId={componentId} />
      <GalleryCardHeader componentId={componentId} hideDescription />
      <div className="flex w-full min-w-0 items-center justify-center">
        {children}
      </div>
    </article>
  );
}

export default function ComponentsGalleryPage() {
  const standardPreviewWidthClass = "w-full max-w-[680px]";
  const withStandardPreviewWidth = (node: ReactNode) => (
    <div className={GALLERY_STANDARD_PREVIEW_WRAPPER_CLASS}>{node}</div>
  );

  const galleryCards: GalleryCardConfig[] = [
    {
      componentId: "option-list",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <OptionList {...optionListPresets["max-selections"].data} />
      ),
    },
    {
      componentId: "question-flow",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () =>
        withStandardPreviewWidth(
          <QuestionFlow {...questionFlowPresets.upfront.data} />,
        ),
    },
    {
      componentId: "plan",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () =>
        withStandardPreviewWidth(<Plan {...planPresets.comprehensive.data} />),
    },
    {
      componentId: "order-summary",
      className: "mb-5 break-inside-avoid 2xl:mb-5",
      render: () => (
        <OrderSummary.Display
          {...orderSummaryPresets.default.data}
          className={standardPreviewWidthClass}
        />
      ),
    },
    {
      componentId: "item-carousel",
      className: "mb-5 flex justify-center 2xl:col-span-full 2xl:mb-5",
      render: () => (
        <div className="w-full min-w-0 max-w-full">
          <ItemCarousel {...itemCarouselPresets.recommendations.data} />
        </div>
      ),
    },
    {
      componentId: "data-table",
      className: "mb-5 flex justify-center 2xl:col-span-full 2xl:mb-5",
      render: () => (
        <div className="w-full min-w-0 max-w-full">
          <DataTable {...dataTablePresets.stocks.data} />
        </div>
      ),
    },
    {
      componentId: "code-diff",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <CodeDiff {...codeDiffPresets.refactor.data} />,
    },
    {
      componentId: "stats-display",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <StatsDisplay {...statsDisplayPresets["business-metrics"].data} />
      ),
    },
    {
      componentId: "weather-widget",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <WeatherWidget
          {...weatherWidgetPresets["sunny-forecast"].data}
          current={{
            temperature: 64,
            tempMin: 58,
            tempMax: 72,
            conditionCode: "thunderstorm",
          }}
          updatedAt="2026-01-29T02:30:00Z"
          effects={{ enabled: true, quality: "low" }}
        />
      ),
    },
    {
      componentId: "image-gallery",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <ImageGallery {...imageGalleryPresets["search-results"].data} />
      ),
    },
    {
      componentId: "geo-map",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <GeoMap id="gallery-geo-map" {...geoMapPresets.fleet.data} />
      ),
    },
    {
      componentId: "link-preview",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <LinkPreview {...linkPreviewPresets["with-image"].data.linkPreview} />
      ),
    },
    {
      componentId: "citation",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <CitationList
          id="gallery-citations"
          citations={citationPresets.stacked.data.citations}
          variant="stacked"
        />
      ),
    },
    {
      componentId: "audio",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <Audio {...audioPresets.full.data.audio} />,
    },
    {
      componentId: "approval-card",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <ApprovalCard {...approvalCardPresets["with-metadata"].data} />
      ),
    },
    {
      componentId: "message-draft",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () =>
        withStandardPreviewWidth(
          <MessageDraft {...messageDraftPresets.email.data} />,
        ),
    },
    {
      componentId: "progress-tracker",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () =>
        withStandardPreviewWidth(
          <ProgressTracker {...progressTrackerPresets["in-progress"].data} />,
        ),
    },
    {
      componentId: "parameter-slider",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () =>
        withStandardPreviewWidth(
          <ParameterSlider
            {...parameterSliderPresets["photo-adjustments"].data}
          />,
        ),
    },
    {
      componentId: "terminal",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <Terminal {...terminalPresets.success.data} />,
    },
    {
      componentId: "code-block",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <CodeBlock {...codeBlockPresets.typescript.data} />,
    },
    {
      componentId: "chart",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <Chart id="gallery-chart" {...chartPresets.revenue.data} />,
    },
    {
      componentId: "preferences-panel",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () =>
        withStandardPreviewWidth(
          <PreferencesPanel {...preferencesPanelPresets.privacy.data} />,
        ),
    },
    {
      componentId: "x-post",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <XPost post={xPostPresets.basic.data.post} />,
    },
    {
      componentId: "instagram-post",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <InstagramPost post={instagramPostPresets.basic.data.post} />
      ),
    },
    {
      componentId: "linkedin-post",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <LinkedInPost post={linkedInPostPresets.basic.data.post} />,
    },
  ];

  const stackRankOrder: GalleryComponentDocId[] = [
    "option-list",
    "question-flow",
    "weather-widget",
    "plan",
    "parameter-slider",
    "item-carousel",
    "code-diff",
    "data-table",
    "stats-display",
    "geo-map",
    "image-gallery",
    "code-block",
    "audio",
    "terminal",
  ];
  const stackRankByComponentId = new Map(
    stackRankOrder.map((componentId, rank) => [componentId, rank]),
  );
  const rankedGalleryCards = galleryCards
    .map((card, originalIndex) => ({ card, originalIndex }))
    .sort((a, b) => {
      const aRank =
        stackRankByComponentId.get(a.card.componentId) ??
        Number.POSITIVE_INFINITY;
      const bRank =
        stackRankByComponentId.get(b.card.componentId) ??
        Number.POSITIVE_INFINITY;

      if (aRank !== bRank) {
        return aRank - bRank;
      }
      return a.originalIndex - b.originalIndex;
    })
    .map(({ card }) => card);

  const [leftColumnCards, rightColumnCards] = rankedGalleryCards.reduce<
    [GalleryCardConfig[], GalleryCardConfig[]]
  >(
    (columns, card, index) => {
      columns[index % 2].push(card);
      return columns;
    },
    [[], []],
  );

  const renderGalleryCard = (card: GalleryCardConfig) => (
    <GalleryPreviewCard
      key={card.componentId}
      componentId={card.componentId}
      className={card.className}
    >
      <div className="flex w-full justify-center">{card.render()}</div>
    </GalleryPreviewCard>
  );

  return (
    <main
      aria-label="Tool UI component gallery"
      className="w-full p-6 sm:p-10 lg:p-12"
    >
      <h1 className="sr-only">Tool UI Component Gallery</h1>
      <GalleryPageAnalytics />
      <div className={GALLERY_LAYOUT_CLASS}>
        <div className={GALLERY_MOBILE_STACK_CLASS}>
          {rankedGalleryCards.map(renderGalleryCard)}
        </div>

        <div className={GALLERY_DESKTOP_GRID_CLASS}>
          <div className={GALLERY_COLUMN_STACK_CLASS}>
            {leftColumnCards.map(renderGalleryCard)}
          </div>
          <div className={GALLERY_COLUMN_STACK_CLASS}>
            {rightColumnCards.map(renderGalleryCard)}
          </div>
        </div>
      </div>
    </main>
  );
}
