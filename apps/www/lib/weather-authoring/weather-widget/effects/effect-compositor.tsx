"use client";

import { useEffect, useMemo, useState } from "react";
import type { WeatherConditionCode } from "../schema";
import {
  resolveWeatherEffectsCanvasProps,
  type WeatherEffectsCheckpointMode,
} from "./canvas-resolver";
import type { CustomEffectProps } from "./custom-effect-props";
import { mapCustomEffectPropsToCanvasProps } from "./effect-compositor-custom-props";
import {
  resolveEffectCanvasDpr,
  resolveEffectQuality,
} from "./effect-compositor-quality";
import { TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES } from "./generated/tuned-presets.generated";
import { type WeatherEffectsTunedPresets } from "./tuning";
import type { EffectSettings } from "./types";
import { WeatherEffectsCanvas } from "./weather-effects-canvas";
import type { WeatherEffectsCanvasProps } from "./weather-effects-types";

const DEFAULT_CHECKPOINT_MODE: WeatherEffectsCheckpointMode = "nearest";
const DEFAULT_TUNED_PRESETS: WeatherEffectsTunedPresets =
  TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES;

interface EffectCompositorProps {
  conditionCode: WeatherConditionCode;
  windSpeed?: number;
  precipitationLevel?: "none" | "light" | "moderate" | "heavy";
  visibility?: number;
  timestamp?: string;
  timeOfDay?: number;
  settings?: EffectSettings;
  className?: string;
  /**
   * Custom effect props for direct control over all effect parameters.
   * When provided, these override the auto-calculated values.
   */
  customProps?: CustomEffectProps;
}

export function EffectCompositor({
  conditionCode,
  windSpeed,
  precipitationLevel,
  visibility,
  timestamp,
  timeOfDay,
  settings,
  className,
  customProps,
}: EffectCompositorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const enabled = settings?.enabled !== false;
  const reducedMotion = settings?.reducedMotion ?? false;
  const hasCustomProps = customProps !== undefined;
  const resolvedQuality = useMemo(
    () => resolveEffectQuality(settings?.quality ?? "auto"),
    [settings?.quality],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dpr = useMemo(() => {
    return resolveEffectCanvasDpr(resolvedQuality);
  }, [resolvedQuality]);

  const canvasProps = useMemo<WeatherEffectsCanvasProps | null>(() => {
    if (!enabled || reducedMotion) return null;

    if (hasCustomProps && customProps) {
      return mapCustomEffectPropsToCanvasProps(customProps);
    }

    return resolveWeatherEffectsCanvasProps({
      conditionCode,
      windSpeed,
      precipitationLevel,
      visibility,
      timestamp,
      timeOfDay,
      tunedPresets: DEFAULT_TUNED_PRESETS,
      checkpointMode: DEFAULT_CHECKPOINT_MODE,
    });
  }, [
    enabled,
    reducedMotion,
    hasCustomProps,
    customProps,
    conditionCode,
    windSpeed,
    precipitationLevel,
    visibility,
    timestamp,
    timeOfDay,
  ]);

  if (!isMounted || !enabled || reducedMotion || !canvasProps) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        borderRadius: "inherit",
      }}
      aria-hidden="true"
    >
      <WeatherEffectsCanvas
        className="absolute inset-0"
        dpr={dpr}
        {...canvasProps}
      />
    </div>
  );
}
