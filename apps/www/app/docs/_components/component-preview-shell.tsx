"use client";

import { memo, useCallback, type ReactNode } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import type { ImperativePanelGroupHandle } from "react-resizable-panels";
import { Check, Code, Copy, Eye, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/ui/cn";
import { useResponsivePreview } from "@/hooks/use-responsive-preview";
import { useTabSearchParam } from "@/hooks/use-tab-search-param";
import { useCopyToClipboard } from "@/components/tool-ui/shared";
import { InstallCommandBlock } from "./install-command-block";
import { analytics } from "@/lib/analytics";

const PREVIEW_MIN_WIDTH = 40;
const PREVIEW_MAX_WIDTH = 100;

const VALID_VIEW_MODES = ["canvas", "chat", "code"] as const;
type ViewMode = (typeof VALID_VIEW_MODES)[number];

function toStablePanelIdSegment(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "component";
}

const toggleItemClass = cn(
  "size-7 rounded-md border-0 bg-transparent text-muted-foreground",
  "hover:text-foreground hover:bg-accent/40",
  "data-[state=on]:bg-accent/60 data-[state=on]:text-foreground",
);

function ViewModeToggle({
  value,
  onValueChange,
}: {
  value: ViewMode;
  onValueChange: (value: ViewMode) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange(v as ViewMode)}
      size="sm"
      className="gap-0.5 rounded-md border border-border/50 bg-background/80 p-0.5 backdrop-blur-md"
    >
      <ToggleGroupItem
        value="canvas"
        aria-label="View canvas"
        className={toggleItemClass}
      >
        <Eye className="size-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="chat"
        aria-label="View in chat context"
        className={toggleItemClass}
      >
        <MessageCircle className="size-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="code"
        aria-label="View code"
        className={toggleItemClass}
      >
        <Code className="size-3.5" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

const RESIZE_HANDLE_STYLES = cn(
  "absolute top-1/2 left-1/2 h-12 w-1",
  "-translate-x-1/2 -translate-y-1/2 rounded-full",
  "transition-all duration-200",
  "bg-gray-300 opacity-0",
  "group-hover/canvas:opacity-60",
  "group-data-resize-handle-active/handle:bg-gray-500 group-data-resize-handle-active/handle:opacity-100",
  "dark:bg-gray-500 dark:group-data-resize-handle-active/handle:bg-gray-400",
);

const ResizablePreviewArea = memo(function ResizablePreviewArea({
  panelGroupRef,
  handleLayout,
  panelIdBase,
  children,
}: {
  panelGroupRef: React.RefObject<ImperativePanelGroupHandle | null>;
  handleLayout: (sizes: number[]) => void;
  panelIdBase: string;
  children: ReactNode;
}) {
  return (
    <PanelGroup
      id={`${panelIdBase}-group`}
      ref={panelGroupRef}
      direction="horizontal"
      onLayout={handleLayout}
      className="group/canvas"
    >
      <Panel id={`${panelIdBase}-left`} defaultSize={7.5} minSize={0} />
      <PanelResizeHandle
        id={`${panelIdBase}-left-handle`}
        className="group/handle relative w-4"
      >
        <div className={RESIZE_HANDLE_STYLES} />
      </PanelResizeHandle>
      <Panel
        id={`${panelIdBase}-center`}
        defaultSize={85}
        minSize={PREVIEW_MIN_WIDTH}
        maxSize={PREVIEW_MAX_WIDTH}
      >
        <div
          className={cn(
            "scrollbar-subtle relative overflow-x-auto",
            "transition-all",
          )}
        >
          {children}
        </div>
      </Panel>
      <PanelResizeHandle
        id={`${panelIdBase}-right-handle`}
        className="group/handle relative w-4"
      >
        <div className={RESIZE_HANDLE_STYLES} />
      </PanelResizeHandle>
      <Panel id={`${panelIdBase}-right`} defaultSize={7.5} minSize={0} />
    </PanelGroup>
  );
});

interface ComponentPreviewShellProps {
  componentId: string;
  sidebar: ReactNode;
  preview: ReactNode;
  chatPanel: ReactNode;
  codePanel: ReactNode;
  code: string;
}

const COPY_ID = "code-panel";

export function ComponentPreviewShell({
  componentId,
  sidebar,
  preview,
  chatPanel,
  codePanel,
  code,
}: ComponentPreviewShellProps) {
  const { activeTab: viewMode, setActiveTab: setViewMode } =
    useTabSearchParam<ViewMode>({
      paramName: "view",
      defaultTab: "canvas",
      validTabs: VALID_VIEW_MODES,
    });
  const { copiedId, copy } = useCopyToClipboard();
  const copied = copiedId === COPY_ID;
  const panelIdBase = `component-preview-${toStablePanelIdSegment(componentId)}`;
  const { panelGroupRef, handleLayout } = useResponsivePreview({
    minWidth: PREVIEW_MIN_WIDTH,
    maxWidth: PREVIEW_MAX_WIDTH,
  });

  const handleCopy = useCallback(() => {
    analytics.component.codeCopied(componentId, "full");
    analytics.code.blockCopied("tsx", "component_preview");
    copy(code, COPY_ID);
  }, [componentId, code, copy]);

  const handleViewModeChange = useCallback(
    (nextViewMode: ViewMode) => {
      if (nextViewMode === viewMode) return;
      analytics.component.tabSwitched(componentId, nextViewMode);
      analytics.component.previewInteracted(
        componentId,
        `view_mode_${nextViewMode}`,
      );
      setViewMode(nextViewMode);
    },
    [componentId, setViewMode, viewMode],
  );

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "scrollbar-subtle hidden w-64 shrink-0 flex-col",
          "border-r border-border/40",
          "lg:flex",
        )}
      >
        <div className="flex flex-1 flex-col gap-3 px-3 py-4">{sidebar}</div>
      </aside>

      {/* Main content area */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Install commands */}
        <div className="shrink-0 border-b border-border/40 px-4 py-3 sm:px-6">
          <InstallCommandBlock componentId={componentId} variant="block" />
        </div>

        {/* Mobile toolbar */}
        <div className="flex flex-col gap-3 border-b border-border/40 px-4 pt-3 pb-3 lg:hidden">
          <div className="scrollbar-subtle overflow-x-auto">{sidebar}</div>
          <div className="flex items-center justify-end">
            <ViewModeToggle
              value={viewMode}
              onValueChange={handleViewModeChange}
            />
          </div>
        </div>

        <div
          className={cn(
            "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
            "bg-neutral-100 dark:bg-neutral-950",
          )}
        >
          {viewMode === "canvas" && (
            <div
              className="bg-dot-grid pointer-events-none absolute inset-0 z-0 dark:opacity-60"
              aria-hidden="true"
            />
          )}

          {viewMode === "code" && (
            <div
              className={cn(
                "pointer-events-none absolute top-0 right-12 left-0 z-20 h-20",
                "bg-linear-to-b from-neutral-100 via-neutral-100/80 to-transparent dark:from-neutral-950 dark:via-neutral-950/80",
                "hidden lg:block",
              )}
              aria-hidden="true"
            />
          )}

          {/* View mode toggle - top left */}
          <div className="absolute top-3 left-3 z-30 hidden lg:block">
            <ViewModeToggle
              value={viewMode}
              onValueChange={handleViewModeChange}
            />
          </div>

          {/* Copy button - top right (code view only) */}
          {viewMode === "code" && (
            <div className="absolute top-3 right-3 z-30 hidden lg:block">
              <Button
                variant="secondary"
                size="icon"
                onClick={handleCopy}
                aria-label={copied ? "Copied" : "Copy code"}
                title={copied ? "Copied" : "Copy code"}
                className="size-8 shadow-sm"
              >
                {copied ? (
                  <Check className="size-4 text-green-500" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          )}

          <div
            className={cn(
              "scrollbar-subtle relative z-10",
              "flex min-h-0 min-w-0 flex-1",
              viewMode === "code"
                ? "flex-col"
                : "items-start justify-center overflow-y-auto",
            )}
          >
            {viewMode === "canvas" && (
              <div className="relative h-fit w-full p-4 pt-12 lg:pt-16">
                <ResizablePreviewArea
                  panelGroupRef={panelGroupRef}
                  handleLayout={handleLayout}
                  panelIdBase={panelIdBase}
                >
                  {preview}
                </ResizablePreviewArea>
              </div>
            )}
            {viewMode === "chat" && (
              <div className="relative h-fit w-full p-4 pt-12 lg:pt-16">
                <div className="mx-auto max-w-2xl">{chatPanel}</div>
              </div>
            )}
            {viewMode === "code" && codePanel}
          </div>
        </div>
      </div>
    </div>
  );
}
