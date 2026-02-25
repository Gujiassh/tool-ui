import type { Metadata } from "next";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import {
  GalleryPageAnalytics,
  GalleryPreviewImpression,
} from "@/app/docs/_components/gallery-analytics.client";
import { DocsBorderedShell } from "@/app/docs/_components/docs-bordered-shell";
import { GalleryCardHeader } from "@/app/docs/_components/gallery-card-header";
import { DataTable } from "@/components/tool-ui/data-table";
import { Image } from "@/components/tool-ui/image";
import { ItemCarousel } from "@/components/tool-ui/item-carousel";
import { OrderSummary } from "@/components/tool-ui/order-summary";
import { StatsDisplay } from "@/components/tool-ui/stats-display";
import { type GalleryComponentDocId } from "@/lib/docs/gallery-component-docs";
import { approvalCardPresets } from "@/lib/presets/approval-card";
import { audioPresets } from "@/lib/presets/audio";
import { chartPresets } from "@/lib/presets/chart";
import { citationPresets } from "@/lib/presets/citation";
import { codeBlockPresets } from "@/lib/presets/code-block";
import { codeDiffPresets } from "@/lib/presets/code-diff";
import { dataTablePresets } from "@/lib/presets/data-table";
import { imagePresets } from "@/lib/presets/image";
import { instagramPostPresets } from "@/lib/presets/instagram-post";
import { imageGalleryPresets } from "@/lib/presets/image-gallery";
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
        "group/gallery-card relative flex min-w-0 max-w-full flex-col gap-2 overflow-hidden rounded-xl border border-border/60 bg-card p-3 shadow-sm",
        className,
      )}
    >
      <GalleryCardHeader componentId={componentId} hideDescription />
      <GalleryPreviewImpression componentId={componentId} />
      <div className="scrollbar-subtle flex w-full min-w-0 max-w-full justify-center overflow-x-auto rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
        {children}
      </div>
    </article>
  );
}

export default function ComponentsGalleryPage() {
  const galleryImage = imagePresets["with-source"].data.image;
  const galleryCards: GalleryCardConfig[] = [
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
      componentId: "option-list",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <OptionList {...optionListPresets["max-selections"].data} />
      ),
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
      render: () => <MessageDraft {...messageDraftPresets.email.data} />,
    },
    {
      componentId: "order-summary",
      className: "mb-5 break-inside-avoid 2xl:mb-5",
      render: () => (
        <OrderSummary.Display
          {...orderSummaryPresets.default.data}
          className="max-w-none"
        />
      ),
    },
    {
      componentId: "plan",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <Plan {...planPresets.comprehensive.data} />,
    },
    {
      componentId: "progress-tracker",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <ProgressTracker {...progressTrackerPresets["in-progress"].data} />
      ),
    },
    {
      componentId: "question-flow",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <QuestionFlow {...questionFlowPresets.upfront.data} />,
    },
    {
      componentId: "parameter-slider",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <ParameterSlider
          {...parameterSliderPresets["photo-adjustments"].data}
        />
      ),
    },
    {
      componentId: "preferences-panel",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <PreferencesPanel {...preferencesPanelPresets.privacy.data} />
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
      componentId: "code-diff",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <CodeDiff {...codeDiffPresets["refactor"].data} />,
    },
    {
      componentId: "chart",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <Chart id="gallery-chart" {...chartPresets.revenue.data} />,
    },
    {
      componentId: "video",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <Video {...videoPresets["with-poster"].data.video} />,
    },
    {
      componentId: "image",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <Image {...galleryImage} alt={galleryImage.alt} />,
    },
    {
      componentId: "linkedin-post",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <LinkedInPost post={linkedInPostPresets.basic.data.post} />,
    },
    {
      componentId: "instagram-post",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => (
        <InstagramPost post={instagramPostPresets.basic.data.post} />
      ),
    },
    {
      componentId: "x-post",
      className: "mb-5 flex break-inside-avoid justify-center 2xl:mb-5",
      render: () => <XPost post={xPostPresets.basic.data.post} />,
    },
    {
      componentId: "item-carousel",
      className: "mb-5 flex justify-center 2xl:col-span-full 2xl:mb-5",
      render: () => (
        <div className="w-full max-w-full min-w-0">
          <ItemCarousel {...itemCarouselPresets.recommendations.data} />
        </div>
      ),
    },
    {
      componentId: "data-table",
      className: "mb-5 flex justify-center 2xl:col-span-full 2xl:mb-5",
      render: () => (
        <div className="w-full max-w-full min-w-0">
          <DataTable {...dataTablePresets.stocks.data} />
        </div>
      ),
    },
  ];

  return (
    <DocsBorderedShell>
      <main
        aria-label="Tool UI component gallery"
        className="scrollbar-subtle z-10 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-6 sm:p-10 lg:p-12"
      >
        <h1 className="sr-only">Tool UI Component Gallery</h1>
        <GalleryPageAnalytics />
        <div className="mx-auto w-full min-w-0 max-w-full columns-1 gap-5 overflow-x-hidden pb-20 [column-fill:balance] md:columns-2">
          {galleryCards.map((card) => (
            <GalleryPreviewCard
              key={card.componentId}
              componentId={card.componentId}
              className={card.className}
            >
              {card.render()}
            </GalleryPreviewCard>
          ))}

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
      </main>
    </DocsBorderedShell>
  );
}
