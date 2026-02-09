"use client";

import { useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/ui/cn";
import { Slider } from "@/components/ui/slider";
import { WeatherEffectsCanvas } from "@/components/tool-ui/weather-widget/effects/weather-effects-canvas";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import type { TimeCheckpoint } from "../types";
import type { TuningStateReturn } from "../hooks/use-tuning-state";
import { TIME_CHECKPOINTS, TIME_CHECKPOINT_ORDER } from "../lib/constants";
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
  onToggleCurve,
  isCurveOpen,
}: {
  param: ParameterDef;
  layer: TunableLayerKey;
  tuningState: TuningStateReturn;
  condition: WeatherCondition;
  onToggleCurve?: () => void;
  isCurveOpen?: boolean;
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

      const layerParams = full[layer] as Record<string, unknown>;
      const baseParams = base[layer] as Record<string, unknown>;

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
          {onToggleCurve && (
            <button
              type="button"
              onClick={onToggleCurve}
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider",
                isCurveOpen
                  ? "bg-foreground text-background"
                  : "bg-muted/60 text-muted-foreground/70 hover:bg-muted"
              )}
            >
              Keyframes
            </button>
          )}
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

type Keyframe = {
  checkpoint: TimeCheckpoint;
  t: number;
  value: number | boolean;
};

function getNearestCheckpointKey(time: number): TimeCheckpoint {
  const normalized = ((time % 1) + 1) % 1;
  let nearest = TIME_CHECKPOINT_ORDER[0];
  let minDist = Infinity;

  for (const checkpoint of TIME_CHECKPOINT_ORDER) {
    const value = TIME_CHECKPOINTS[checkpoint].value;
    let dist = Math.abs(normalized - value);
    if (dist > 0.5) dist = 1 - dist;
    if (dist < minDist) {
      minDist = dist;
      nearest = checkpoint;
    }
  }

  return nearest;
}

function normalizeKeyframes(
  knots: Array<{ t: number; value: number | boolean }>,
): Keyframe[] {
  const normalized = new Map<TimeCheckpoint, Keyframe>();
  for (const knot of knots) {
    const checkpoint = getNearestCheckpointKey(knot.t);
    normalized.set(checkpoint, {
      checkpoint,
      t: TIME_CHECKPOINTS[checkpoint].value,
      value: knot.value,
    });
  }

  return TIME_CHECKPOINT_ORDER.filter((checkpoint) =>
    normalized.has(checkpoint),
  ).map((checkpoint) => normalized.get(checkpoint)!);
}

function CurveEditor({
  condition,
  layer,
  param,
  tuningState,
}: {
  condition: WeatherCondition;
  layer: TunableLayerKey;
  param: ParameterDef;
  tuningState: TuningStateReturn;
}) {
  const curve = tuningState.getCurveForParam(condition, layer, param.key);
  const mode =
    curve?.mode === "absolute" ? "absolute" : ("delta" as const);
  const interpolation =
    curve?.interpolation ?? (param.key === "autoMode" ? "step" : "linear");

  const baseAt = useCallback(
    (t: number) =>
      tuningState.getBaseValueAtTime(
        condition,
        t,
        layer,
        param.key,
      ) as number | boolean,
    [condition, layer, param.key, tuningState],
  );

  const defaultKeyframes = useMemo(() => {
    return TIME_CHECKPOINT_ORDER.map((checkpoint) => {
      const t = TIME_CHECKPOINTS[checkpoint].value;
      const full = tuningState.getFullParamsForCheckpoint(
        condition,
        checkpoint,
      );
      const group = full[layer] as Record<string, unknown>;
      const value = group[param.key] as number;
      return { checkpoint, t, value };
    });
  }, [condition, layer, param.key, tuningState]);

  const uiKeyframes = useMemo(() => {
    if (!curve || !curve.knots || curve.knots.length === 0) {
      return defaultKeyframes;
    }

    const mapped = curve.knots.map((knot) => {
      const value =
        typeof knot.value === "number" && mode === "delta"
          ? knot.value + (baseAt(knot.t) as number)
          : knot.value;
      return { t: knot.t, value };
    });

    return normalizeKeyframes(mapped);
  }, [baseAt, curve, defaultKeyframes, mode]);

  const commitKeyframes = useCallback(
    (next: Array<Keyframe>) => {
      const normalized = normalizeKeyframes(
        next.map(({ t, value }) => ({ t, value })),
      );
      const storedKnots = normalized.map((knot) => {
        const value =
          mode === "delta"
            ? knot.value - (baseAt(knot.t) as number)
            : knot.value;
        return { t: knot.t, value };
      });

      tuningState.setCurveForParam(condition, layer, param.key, {
        knots: storedKnots,
        mode,
        interpolation,
      });
    },
    [baseAt, condition, interpolation, layer, mode, param.key, tuningState],
  );

  const handleKeyframeChange = (
    index: number,
    update: Partial<Pick<Keyframe, "checkpoint" | "value">>,
  ) => {
    const next = uiKeyframes.map((frame, idx) => {
      if (idx !== index) return frame;
      const checkpoint = update.checkpoint ?? frame.checkpoint;
      return {
        ...frame,
        checkpoint,
        t: TIME_CHECKPOINTS[checkpoint].value,
        value: update.value ?? frame.value,
      };
    });
    commitKeyframes(next);
  };

  const handleRemoveKeyframe = (index: number) => {
    const next = uiKeyframes.filter((_, idx) => idx !== index);
    if (next.length === 0) {
      tuningState.setCurveForParam(condition, layer, param.key, null);
      return;
    }
    commitKeyframes(next);
  };

  const handleAddKeyframe = () => {
    const used = new Set(uiKeyframes.map((frame) => frame.checkpoint));
    const available = TIME_CHECKPOINT_ORDER.filter(
      (checkpoint) => !used.has(checkpoint),
    );
    const nextCheckpoint = available[0];
    if (!nextCheckpoint) return;

    const full = tuningState.getFullParamsForCheckpoint(
      condition,
      nextCheckpoint,
    );
    const group = full[layer] as Record<string, unknown>;
    const value = group[param.key] as number;

    const next = [
      ...uiKeyframes,
      {
        checkpoint: nextCheckpoint,
        t: TIME_CHECKPOINTS[nextCheckpoint].value,
        value,
      },
    ];
    commitKeyframes(next);
  };

  // Mode and interpolation are preserved from existing curve config;
  // the UI no longer exposes them since prod is checkpoint-only.

  const usedCheckpoints = useMemo(
    () => new Set(uiKeyframes.map((frame) => frame.checkpoint)),
    [uiKeyframes],
  );
  const availableCheckpoints = useMemo(
    () =>
      TIME_CHECKPOINT_ORDER.filter(
        (checkpoint) => !usedCheckpoints.has(checkpoint),
      ),
    [usedCheckpoints],
  );

  return (
    <div className="mt-3 rounded-lg border border-border/30 bg-muted/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Keyframe Editor
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddKeyframe}
            disabled={availableCheckpoints.length === 0}
            className="rounded border border-border/40 bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground/70 hover:bg-muted"
          >
            Add keyframe
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {uiKeyframes.map((frame, index) => (
          <div key={`${frame.checkpoint}-${index}`} className="grid grid-cols-[110px_1fr_88px] items-center gap-3">
            <select
              value={frame.checkpoint}
              onChange={(e) =>
                handleKeyframeChange(index, {
                  checkpoint: e.target.value as TimeCheckpoint,
                })
              }
              className="rounded border border-border/40 bg-background px-2 py-1 text-[10px]"
            >
              {TIME_CHECKPOINT_ORDER.map((checkpoint) => {
                const isUsed =
                  usedCheckpoints.has(checkpoint) &&
                  checkpoint !== frame.checkpoint;
                return (
                  <option key={checkpoint} value={checkpoint} disabled={isUsed}>
                    {TIME_CHECKPOINTS[checkpoint].label}
                  </option>
                );
              })}
            </select>
            <Slider
              value={[frame.value]}
              min={param.min}
              max={param.max}
              step={param.step}
              onValueChange={([next]) =>
                handleKeyframeChange(index, { value: next })
              }
              className="relative w-full [&_[data-slot=slider-track]]:h-0.5 [&_[data-slot=slider-range]]:bg-foreground/20"
            />
            <button
              type="button"
              onClick={() => handleRemoveKeyframe(index)}
              className="rounded border border-border/40 bg-background px-2 py-1 text-[10px] text-muted-foreground/60 hover:text-foreground"
            >
              Remove keyframe
            </button>
          </div>
        ))}
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
          glassParams={tuningState.glassParams}
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
  const [openParamId, setOpenParamId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="border-border/50 bg-background sticky top-0 z-10 border-b px-4 py-3">
        <div className="grid grid-cols-[160px_repeat(4,minmax(0,1fr))] items-end gap-3">
          <div>
            <h2 className="text-sm font-medium">Time Keyframes</h2>
            <p className="text-muted-foreground mt-1 text-[10px]">
              Adjust a single condition across all checkpoints
            </p>
          </div>
          {TIME_CHECKPOINT_ORDER.map((checkpoint) => (
            <div key={checkpoint} className="text-xs font-medium text-muted-foreground">
              {TIME_CHECKPOINTS[checkpoint].label}
            </div>
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
        {PARAMETER_GROUPS.map((group) => (
          <div key={group.name} className="mt-4">
            <div className="text-[10px] font-medium tracking-wider text-muted-foreground/60 uppercase">
              {group.name}
            </div>
            <div className="mt-2">
              {group.params.map((param) => {
                const paramId = `${group.layer}.${param.key}`;
                const isOpen = openParamId === paramId;
                return (
                  <div key={paramId}>
                    <ParameterTimeRow
                      param={param}
                      layer={group.layer}
                      tuningState={tuningState}
                      condition={condition}
                      isCurveOpen={isOpen}
                      onToggleCurve={() =>
                        setOpenParamId(isOpen ? null : paramId)
                      }
                    />
                    {isOpen && (
                      <CurveEditor
                        condition={condition}
                        layer={group.layer}
                        param={param}
                        tuningState={tuningState}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
