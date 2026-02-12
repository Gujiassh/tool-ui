import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { DocsBorderedShell } from "@/app/docs/_components/docs-bordered-shell";
import { GalleryDocsLink } from "@/app/docs/_components/gallery-docs-link";
import { DataTable } from "@/components/tool-ui/data-table";
import { Image } from "@/components/tool-ui/image";
import { ItemCarousel } from "@/components/tool-ui/item-carousel";
import { StatsDisplay } from "@/components/tool-ui/stats-display";
import {
  galleryComponentDocs,
  type GalleryComponentDocId,
} from "@/lib/docs/gallery-component-docs";
import { approvalCardPresets } from "@/lib/presets/approval-card";
import { audioPresets } from "@/lib/presets/audio";
import { chartPresets } from "@/lib/presets/chart";
import { citationPresets } from "@/lib/presets/citation";
import { codeBlockPresets } from "@/lib/presets/code-block";
import { dataTablePresets } from "@/lib/presets/data-table";
import { imagePresets } from "@/lib/presets/image";
import { imageGalleryPresets } from "@/lib/presets/image-gallery";
import { itemCarouselPresets } from "@/lib/presets/item-carousel";
import { linkPreviewPresets } from "@/lib/presets/link-preview";
import { linkedInPostPresets } from "@/lib/presets/linkedin-post";
import { messageDraftPresets } from "@/lib/presets/message-draft";
import { optionListPresets } from "@/lib/presets/option-list";
import { orderSummaryPresets } from "@/lib/presets/order-summary";
import { planPresets } from "@/lib/presets/plan";
import { preferencesPanelPresets } from "@/lib/presets/preferences-panel";
import { progressTrackerPresets } from "@/lib/presets/progress-tracker";
import { questionFlowPresets } from "@/lib/presets/question-flow";
import { statsDisplayPresets } from "@/lib/presets/stats-display";
import { terminalPresets } from "@/lib/presets/terminal";
import { videoPresets } from "@/lib/presets/video";
import { weatherWidgetPresets } from "@/lib/presets/weather-widget";
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
const Video = dynamic(() =>
  import("@/components/tool-ui/video").then((m) => m.Video),
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
const OptionList = dynamic(() =>
  import("@/components/tool-ui/option-list").then((m) => m.OptionList),
);
const OrderSummary = dynamic(() =>
  import("@/components/tool-ui/order-summary").then((m) => m.OrderSummary),
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
const Chart = dynamic(() =>
  import("@/components/tool-ui/chart").then((m) => m.Chart),
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

function GalleryPreviewCard({
  componentId,
  className,
  children,
}: GalleryPreviewCardProps) {
  const componentMeta = galleryComponentDocs[componentId];

  return (
    <div className={cn("group/gallery-card relative pt-8", className)}>
      <div className="pointer-events-none absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-1 rounded-full border border-neutral-700/70 bg-neutral-900/90 px-3 py-1 text-[11px] font-medium tracking-wide text-neutral-100 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-200 group-focus-within/gallery-card:translate-y-0 group-focus-within/gallery-card:opacity-100 group-hover/gallery-card:translate-y-0 group-hover/gallery-card:opacity-100 dark:border-neutral-300/80 dark:bg-neutral-100/90 dark:text-neutral-900">
        <span className="text-sm font-semibold">{componentMeta.name}</span>
        <span className="mx-1 text-neutral-400 dark:text-neutral-500">•</span>
        <GalleryDocsLink
          componentId={componentId}
          componentName={componentMeta.name}
          href={componentMeta.docsHref}
          className="pointer-events-auto inline-flex items-center gap-1 text-xs text-neutral-200/90 underline-offset-2 hover:text-white hover:underline focus-visible:underline focus-visible:outline-none dark:text-neutral-700 dark:hover:text-neutral-950"
        />
      </div>
      {children}
    </div>
  );
}

export default function ComponentsGalleryPage() {
  const galleryImage = imagePresets["with-source"].data.image;

  return (
    <DocsBorderedShell>
      <div className="scrollbar-subtle z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 sm:p-10 lg:p-12">
        <div className="mx-auto columns-1 gap-5 pb-20 [column-fill:balance] md:columns-2 2xl:columns-3 2xl:gap-5">
          <GalleryPreviewCard
            componentId="item-carousel"
            className="mb-5 flex justify-center [column-span:all] 2xl:mb-5"
          >
            <ItemCarousel {...itemCarouselPresets.recommendations.data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="data-table"
            className="mb-5 flex justify-center [column-span:all] 2xl:mb-5"
          >
            <DataTable {...dataTablePresets.stocks.data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="stats-display"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <StatsDisplay {...statsDisplayPresets["business-metrics"].data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="weather-widget"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
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
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="image-gallery"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <ImageGallery {...imageGalleryPresets["search-results"].data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="link-preview"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <LinkPreview
              {...linkPreviewPresets["with-image"].data.linkPreview}
            />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="citation"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <CitationList
              id="gallery-citations"
              citations={citationPresets.stacked.data.citations}
              variant="stacked"
            />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="audio"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <Audio {...audioPresets["full"].data.audio} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="option-list"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <OptionList {...optionListPresets["max-selections"].data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="approval-card"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <ApprovalCard {...approvalCardPresets["with-metadata"].data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="message-draft"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <MessageDraft {...messageDraftPresets.email.data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="order-summary"
            className="mb-5 break-inside-avoid 2xl:mb-5"
          >
            <OrderSummary
              {...orderSummaryPresets.default.data}
              className="max-w-none"
            />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="plan"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <Plan {...planPresets.comprehensive.data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="progress-tracker"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <ProgressTracker {...progressTrackerPresets["in-progress"].data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="question-flow"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <QuestionFlow {...questionFlowPresets.upfront.data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="option-list"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <OptionList {...optionListPresets.travel.data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="preferences-panel"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <PreferencesPanel {...preferencesPanelPresets.privacy.data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="terminal"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <Terminal {...terminalPresets.success.data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="code-block"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <CodeBlock {...codeBlockPresets.typescript.data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="chart"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <Chart id="gallery-chart" {...chartPresets.revenue.data} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="video"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <Video {...videoPresets["with-poster"].data.video} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="image"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <Image {...galleryImage} alt={galleryImage.alt} />
          </GalleryPreviewCard>

          <GalleryPreviewCard
            componentId="linkedin-post"
            className="mb-5 flex break-inside-avoid justify-center 2xl:mb-5"
          >
            <LinkedInPost post={linkedInPostPresets.basic.data.post} />
          </GalleryPreviewCard>

          {/* <div className="mb-5 flex justify-center break-inside-avoid 2xl:mb-5">
            <Link
              href="/builder"
              className="bg-foreground/5 text-muted-foreground bg-dot-grid hover:text-foreground hover:bg-primary/7 group flex min-h-[180px] w-full flex-row items-center justify-center gap-2 rounded-2xl p-6 text-center shadow-[inset_0_6px_20px_rgba(0,0,0,0.09)] transition-colors duration-300"
            >
              <span className="text-primary text-2xl font-light tracking-wide transition-transform duration-600 will-change-transform group-hover:scale-105">
                Build your own tool UI
              </span>
              <ArrowRightIcon className="size-6 shrink-0 transition-transform duration-600 will-change-transform group-hover:translate-x-3 group-hover:scale-105" />
            </Link>
          </div> */}
        </div>
      </div>
    </DocsBorderedShell>
  );
}
