"use client";

import { useMemo } from "react";
import { cn } from "@/lib/ui/cn";
import { Slider } from "@/components/ui/slider";
import { WeatherEffectsCanvas } from "@/components/tool-ui/weather-widget/effects/weather-effects-canvas";
import type { LucideIcon } from "lucide-react";
import {
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sparkles,
  SunDim,
  SunMedium,
} from "lucide-react";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import type { TimeCheckpoint } from "../types";
import type { TuningStateReturn } from "../hooks/use-tuning-state";
import { TIME_CHECKPOINT_ORDER } from "../lib/constants";
import { mapCompositorParamsToCanvasProps } from "../lib/map-to-canvas-props";
import {
  WeatherDataOverlay,
  createWeatherOverlayStubData,
} from "./weather-data-overlay";
import {
  PARAMETER_GROUPS,
  type ParameterDef,
  type TunableLayerKey,
} from "./parameter-definitions";

const PARAMETER_GROUP_ICONS: Record<string, LucideIcon> = {
  Sky: SunDim,
  "Sun Rays": SunMedium,
  Clouds: Cloud,
  Rain: CloudRain,
  Snow: CloudSnow,
  Lightning: CloudLightning,
  Glass: Sparkles,
};

const PARAMETER_GROUP_COLORS: Record<
  string,
  { dot: string; text: string }
> = {
  Sky: { dot: "text-sky-500/80", text: "text-sky-500/80" },
  "Sun Rays": { dot: "text-amber-500/80", text: "text-amber-500/80" },
  Clouds: { dot: "text-slate-400/80", text: "text-slate-400/80" },
  Rain: { dot: "text-blue-500/80", text: "text-blue-500/80" },
  Snow: { dot: "text-cyan-400/80", text: "text-cyan-400/80" },
  Lightning: { dot: "text-violet-400/80", text: "text-violet-400/80" },
  Glass: { dot: "text-teal-400/80", text: "text-teal-400/80" },
};

interface TimeMatrixViewProps {
  tuningState: TuningStateReturn;
  condition: WeatherCondition;
}

function getNumericValue(
  params: Record<string, unknown>,
  key: string,
): number | undefined {
  const value = params[key];
  return typeof value === "number" ? value : undefined;
}

function CheckpointSlider({
  value,
  baseValue,
  min,
  max,
  step,
  onChange,
  label,
}: {
  value: number;
  baseValue: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const isChanged = Math.abs(value - baseValue) > 0.001;
  const displayValue = value.toFixed(2);

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        {isChanged && (
          <div
            className="absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-muted-foreground/40"
            style={{
              left: `${((baseValue - min) / (max - min)) * 100}%`,
            }}
            title={`Base: ${baseValue.toFixed(2)}`}
          />
        )}
        <Slider
          aria-label={`${label} ${displayValue}`}
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={([next]) => onChange(next)}
          className="relative w-full [&_[data-slot=slider-track]]:h-0.5 [&_[data-slot=slider-range]]:bg-foreground/20"
        />
      </div>
      <span
        className={cn(
          "font-mono text-[10px] tabular-nums",
          isChanged
            ? "text-amber-600/80 dark:text-amber-400/80"
            : "text-muted-foreground/50",
        )}
      >
        {displayValue}
      </span>
    </div>
  );
}

function ParameterTimeRow({
  param,
  layer,
  tuningState,
  condition,
}: {
  param: ParameterDef;
  layer: TunableLayerKey;
  tuningState: TuningStateReturn;
  condition: WeatherCondition;
}) {
  const values = useMemo(() => {
    return TIME_CHECKPOINT_ORDER.map((checkpoint) => {
      const full = tuningState.getFullParamsForCheckpoint(
        condition,
        checkpoint,
      );
      const base = tuningState.getBaseParamsForCheckpoint(
        condition,
        checkpoint,
      );

      const layerParams = full[layer] as unknown as Record<string, unknown>;
      const baseParams = base[layer] as unknown as Record<string, unknown>;

      const value = getNumericValue(layerParams, param.key);
      const baseValue = getNumericValue(baseParams, param.key);

      return {
        checkpoint,
        value,
        baseValue,
      };
    });
  }, [condition, layer, param.key, tuningState]);

  const hasValue = values.some((entry) => typeof entry.value === "number");
  if (!hasValue) return null;

  return (
    <div className="border-b border-border/20 py-2">
      <div className="grid grid-cols-[160px_repeat(4,minmax(0,1fr))] items-start gap-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
          <span>{param.label}</span>
        </div>
      {values.map(({ checkpoint, value, baseValue }) => {
        if (typeof value !== "number" || typeof baseValue !== "number") {
          return (
            <div key={checkpoint} className="text-[10px] text-muted-foreground/40">
              —
            </div>
          );
        }

        return (
          <CheckpointSlider
            key={checkpoint}
            value={value}
            baseValue={baseValue}
            min={param.min}
            max={param.max}
            step={param.step}
            label={`${param.label} ${checkpoint}`}
            onChange={(next) =>
              tuningState.updateParameterAtCheckpoint(
                condition,
                checkpoint,
                layer,
                param.key,
                next,
              )
            }
          />
        );
      })}
      </div>
    </div>
  );
}


function CheckpointPreview({
  condition,
  checkpoint,
  tuningState,
}: {
  condition: WeatherCondition;
  checkpoint: TimeCheckpoint;
  tuningState: TuningStateReturn;
}) {
  const params = useMemo(
    () => tuningState.getFullParamsForCheckpoint(condition, checkpoint),
    [condition, checkpoint, tuningState],
  );
  const canvasProps = useMemo(
    () => mapCompositorParamsToCanvasProps(params),
    [params],
  );
  const overlayData = useMemo(
    () => createWeatherOverlayStubData(condition),
    [condition],
  );

  return (
    <div className="border-border/50 relative aspect-4/3 w-full overflow-hidden rounded-md border bg-black">
      <WeatherEffectsCanvas className="absolute inset-0" {...canvasProps} />
      <div className="absolute inset-0 z-10">
        <WeatherDataOverlay
          glassParams={params.glass}
          location={overlayData.location}
          condition={condition}
          temperature={overlayData.temperature}
          tempHigh={overlayData.tempHigh}
          tempLow={overlayData.tempLow}
          humidity={overlayData.humidity}
          windSpeed={overlayData.windSpeed}
          visibility={overlayData.visibility}
          forecast={overlayData.forecast}
          unit={overlayData.unit}
          timeOfDay={params.celestial.timeOfDay}
        />
      </div>
    </div>
  );
}

export function TimeMatrixView({ tuningState, condition }: TimeMatrixViewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-border/50 bg-background sticky top-0 z-10 border-b px-4 py-3">
        <div className="grid grid-cols-[160px_repeat(4,minmax(0,1fr))] items-end gap-3">
          <div />
          {TIME_CHECKPOINT_ORDER.map((checkpoint) => (
            <div key={checkpoint} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-4 backdrop-blur border-b border-border/30">
          <div className="grid grid-cols-4 gap-3">
            {TIME_CHECKPOINT_ORDER.map((checkpoint) => (
              <CheckpointPreview
                key={checkpoint}
                condition={condition}
                checkpoint={checkpoint}
                tuningState={tuningState}
              />
            ))}
          </div>
        </div>
        {PARAMETER_GROUPS.map((group) => {
          const Icon = PARAMETER_GROUP_ICONS[group.name];
          const color = PARAMETER_GROUP_COLORS[group.name] ?? {
            dot: "text-muted-foreground/60",
            text: "text-muted-foreground/60",
          };

          return (
            <div key={group.name} className="mt-4">
              <div className="flex items-center gap-2 text-[10px] font-medium tracking-wider uppercase">
                {Icon ? (
                  <div
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full border border-border/40 bg-muted/40",
                      color.dot,
                    )}
                  >
                    <Icon className="size-2.5" />
                  </div>
                ) : null}
                <span className={color.text}>{group.name}</span>
              </div>
              <div className="mt-2">
                {group.params.map((param) => (
                  <ParameterTimeRow
                    key={`${group.layer}.${param.key}`}
                    param={param}
                    layer={group.layer}
                    tuningState={tuningState}
                    condition={condition}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
