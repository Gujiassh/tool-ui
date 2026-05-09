"use client";

import { CheckCircle2, Copy, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/ui/cn";
import {
  WeatherEffectsCanvas,
  type WeatherEffectsCanvasProps,
} from "@/lib/weather-authoring/weather-widget/effects";
import type { WeatherConditionCode } from "@/lib/weather-authoring/weather-widget/schema";
import type {
  FullCompositorParams,
  GlassParams,
} from "../../weather-compositor/presets";
import { CONDITION_LABELS } from "../../weather-compositor/presets";
import { TIME_CHECKPOINT_ORDER, TIME_CHECKPOINTS } from "../lib/constants";
import type { ConditionCheckpoints, TimeCheckpoint } from "../types";
import { GlassControls } from "./glass-controls";
import { ParameterPanel } from "./parameter-panel";
import {
  createWeatherOverlayStubData,
  WeatherDataOverlay,
} from "./weather-data-overlay";

type LayerKey =
  | "layers"
  | "celestial"
  | "cloud"
  | "rain"
  | "lightning"
  | "snow"
  | "glass"
  | "post";

interface DetailEditorProps {
  condition: WeatherConditionCode;
  params: FullCompositorParams;
  canvasProps: WeatherEffectsCanvasProps;
  baseParams: FullCompositorParams;
  checkpoints?: ConditionCheckpoints;
  activeEditCheckpoint: TimeCheckpoint;
  isPreviewing: boolean;
  isSignedOff: boolean;
  expandedGroups: Set<string>;
  currentTime: number;
  showWidgetOverlay: boolean;
  onParamsChange: (params: FullCompositorParams) => void;
  onToggleGroup: (group: string) => void;
  onReset: () => void;
  onSignOff: () => void;
  onCheckpointClick: (checkpoint: TimeCheckpoint) => void;
  onToggleWidgetOverlay: () => void;
  onCopyLayer?: (
    targetCondition: WeatherConditionCode,
    layerKey: LayerKey,
  ) => void;
  onCopyLayerToAll?: (layerKey: LayerKey) => void;
  onCopyCheckpoint?: (targetCheckpoints: TimeCheckpoint[]) => void;
}

export function DetailEditor({
  condition,
  params,
  canvasProps,
  baseParams,
  checkpoints,
  activeEditCheckpoint,
  isPreviewing,
  isSignedOff,
  expandedGroups,
  currentTime,
  showWidgetOverlay,
  onParamsChange,
  onToggleGroup,
  onReset,
  onSignOff,
  onCheckpointClick,
  onToggleWidgetOverlay,
  onCopyLayer,
  onCopyLayerToAll,
  onCopyCheckpoint,
}: DetailEditorProps) {
  const overlayData = useMemo(
    () => createWeatherOverlayStubData(condition),
    [condition],
  );
  const label = CONDITION_LABELS[condition];

  const allCheckpointsReviewed = checkpoints
    ? TIME_CHECKPOINT_ORDER.every((cp) => checkpoints[cp] === "reviewed")
    : false;

  const reviewedCount = checkpoints
    ? TIME_CHECKPOINT_ORDER.filter((cp) => checkpoints[cp] === "reviewed")
        .length
    : 0;

  return (
    <div className="flex h-full gap-5">
      <div className="flex w-[420px] shrink-0 flex-col gap-3">
        <div className="group/widget @container/weather relative aspect-4/3 overflow-hidden rounded-xl border border-border shadow-xl [container-type:size]">
          <div className="absolute inset-0 bg-black">
            <WeatherEffectsCanvas
              className="absolute inset-0"
              {...canvasProps}
            />
          </div>

          {showWidgetOverlay && (
            <div className="absolute inset-0 z-20">
              <WeatherDataOverlay
                glassParams={params.glass}
                timeOfDay={params.celestial.timeOfDay}
                {...overlayData}
              />
            </div>
          )}

          <div className="absolute bottom-2.5 left-2.5 z-20 opacity-0 transition-opacity group-hover/widget:opacity-100">
            <button
              onClick={onToggleWidgetOverlay}
              className="flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-[10px] text-white/70 backdrop-blur-sm transition-all hover:bg-black/70 hover:text-white"
            >
              {showWidgetOverlay ? (
                <EyeOff className="size-3" />
              ) : (
                <Eye className="size-3" />
              )}
              {showWidgetOverlay ? "Hide" : "Show"}
            </button>
          </div>

          {!showWidgetOverlay && (
            <div className="absolute top-2.5 left-2.5 z-20">
              <div className="rounded bg-black/50 px-2 py-1 backdrop-blur-sm">
                <h2 className="font-medium text-white text-xs">{label}</h2>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/40 bg-card/50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-[10px] text-muted-foreground/50 uppercase tracking-wider">
              Checkpoints
            </span>
            <div className="flex items-center gap-2">
              {onCopyCheckpoint && !isPreviewing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground/50 transition-colors hover:bg-accent/50 hover:text-muted-foreground"
                      title={`Copy ${TIME_CHECKPOINTS[activeEditCheckpoint].label} to other checkpoints`}
                    >
                      <Copy className="size-2.5" />
                      Copy to...
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[140px]">
                    <DropdownMenuItem
                      onClick={() => {
                        const targets = TIME_CHECKPOINT_ORDER.filter(
                          (cp) => cp !== activeEditCheckpoint,
                        ) as TimeCheckpoint[];
                        onCopyCheckpoint(targets);
                      }}
                      className="font-medium text-xs"
                    >
                      All checkpoints
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {TIME_CHECKPOINT_ORDER.filter(
                      (cp) => cp !== activeEditCheckpoint,
                    ).map((checkpoint) => (
                      <DropdownMenuItem
                        key={checkpoint}
                        onClick={() =>
                          onCopyCheckpoint([checkpoint as TimeCheckpoint])
                        }
                        className="text-xs"
                      >
                        {TIME_CHECKPOINTS[checkpoint].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <span className="font-mono text-[10px] text-muted-foreground/40">
                {reviewedCount}/4
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {TIME_CHECKPOINT_ORDER.map((checkpoint) => {
              const { value, label } = TIME_CHECKPOINTS[checkpoint];
              const status = checkpoints?.[checkpoint] ?? "pending";
              const isActive = Math.abs(currentTime - value) < 0.02;
              const isReviewed = status === "reviewed";
              const isEditing = checkpoint === activeEditCheckpoint;

              return (
                <button
                  key={checkpoint}
                  onClick={() => onCheckpointClick(checkpoint)}
                  className={cn(
                    "relative py-2 font-medium text-[11px] uppercase tracking-wide transition-colors",
                    isEditing
                      ? "bg-muted-foreground/20 text-foreground"
                      : isActive
                        ? "text-foreground"
                        : isReviewed
                          ? "text-foreground/60"
                          : "text-muted-foreground/40 hover:text-muted-foreground",
                  )}
                  title={`${label} (${status})${isEditing ? " - editing" : ""}`}
                >
                  {label}
                  {isReviewed && !isEditing && (
                    <span className="absolute top-1 right-1 text-[8px]">*</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={onReset}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border/40 bg-card/30 px-3 py-1.5 text-muted-foreground/60 text-xs transition-all hover:bg-accent/50 hover:text-muted-foreground"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
          <button
            onClick={onSignOff}
            disabled={!allCheckpointsReviewed && !isSignedOff}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-all",
              isSignedOff
                ? "border border-green-500/20 bg-green-500/10 text-green-600/70 dark:text-green-400/70"
                : allCheckpointsReviewed
                  ? "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
                  : "cursor-not-allowed bg-muted/20 text-muted-foreground/30",
            )}
            title={
              !allCheckpointsReviewed && !isSignedOff
                ? "Review all checkpoints first"
                : undefined
            }
          >
            {isSignedOff ? (
              <>
                <CheckCircle2 className="size-3" />
                Done
              </>
            ) : (
              "Sign Off"
            )}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <GlassControls
          params={params.glass}
          onChange={(next: GlassParams) =>
            onParamsChange({ ...params, glass: next })
          }
        />

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border/40 bg-card/30">
          <div className="scrollbar-subtle h-full overflow-y-auto">
            <ParameterPanel
              params={params}
              baseParams={baseParams}
              onParamsChange={onParamsChange}
              expandedGroups={expandedGroups}
              onToggleGroup={onToggleGroup}
              activeEditCheckpoint={activeEditCheckpoint}
              isPreviewing={isPreviewing}
              currentCondition={condition}
              onCopyLayer={onCopyLayer}
              onCopyLayerToAll={onCopyLayerToAll}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
