"use client";

import { useMemo, useState, useEffect } from "react";
import type { WeatherConditionCode } from "../schema";
import type { EffectSettings } from "./types";
import {
  WeatherEffectsCanvas,
  type LayerToggles,
  type WeatherEffectsCanvasProps,
} from "./weather-effects-canvas";
import { TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES } from "./tuned-presets";
import { type WeatherEffectsTunedPresets } from "./tuning";
import {
  resolveWeatherEffectsCanvasProps,
  type WeatherEffectsCheckpointMode,
} from "./canvas-resolver";

type ResolvedEffectQuality = "low" | "medium" | "high";

function sunAltitudeToLightIntensity(sunAltitude: number): number {
  // Mirrors the solar contribution curve used by getSceneBrightness.
  const light =
    sunAltitude < 0
      ? 0.05 + (1 + sunAltitude) * 0.1
      : 0.15 + sunAltitude * 0.85;
  return Math.max(0, Math.min(1, light));
}

function resolveAutoQuality(): ResolvedEffectQuality {
  if (typeof window === "undefined") return "high";

  const dpr = window.devicePixelRatio || 1;
  const px = window.innerWidth * window.innerHeight * dpr * dpr;

  // These are best-effort signals; both can be undefined.
  const cores =
    typeof navigator !== "undefined"
      ? navigator.hardwareConcurrency
      : undefined;
  const mem =
    typeof navigator !== "undefined"
      ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory
      : undefined;

  const isSmallScreen = window.innerWidth < 768;

  // Heuristics tuned for “chat widget” workloads:
  // - mobile-ish screens + low memory/cores: low
  // - large pixel budgets (high DPR) on small screens: low/medium
  // - otherwise: medium/high
  if (
    (typeof mem === "number" && mem <= 4) ||
    (typeof cores === "number" && cores <= 4)
  ) {
    return isSmallScreen ? "low" : "medium";
  }

  // ~2.5M pixels ≈ 1280x720. Beyond that, fragment-heavy passes get expensive.
  if (px > 2_500_000) return isSmallScreen ? "low" : "medium";

  return isSmallScreen ? "medium" : "high";
}

function resolveQuality(
  quality: EffectSettings["quality"],
): ResolvedEffectQuality {
  if (quality === "low" || quality === "medium" || quality === "high")
    return quality;
  return resolveAutoQuality();
}

const DEFAULT_CHECKPOINT_MODE: WeatherEffectsCheckpointMode = "nearest";
const DEFAULT_TUNED_PRESETS: WeatherEffectsTunedPresets =
  TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES;

function mapCustomEffectPropsToCanvasProps(
  custom: CustomEffectProps,
): WeatherEffectsCanvasProps | null {
  const enabledLayers = custom.enabledLayers;
  const isLayerEnabled = (
    layer: WeatherEffectLayer,
    hasConfig: boolean,
  ) => {
    if (!hasConfig) return false;
    if (!enabledLayers) return true;
    return enabledLayers.includes(layer);
  };

  const hasCelestial = isLayerEnabled(
    "celestial",
    custom.celestial !== undefined,
  );
  const hasCloud = isLayerEnabled("clouds", custom.cloud !== undefined);
  const hasRain = isLayerEnabled("rain", custom.rain !== undefined);
  const hasLightning = isLayerEnabled(
    "lightning",
    custom.lightning !== undefined,
  );
  const hasSnow = isLayerEnabled("snow", custom.snow !== undefined);
  const hasPost = custom.post !== undefined;

  if (
    !hasCelestial &&
    !hasCloud &&
    !hasRain &&
    !hasLightning &&
    !hasSnow &&
    !hasPost
  ) {
    return null;
  }

  const layers: Partial<LayerToggles> = {
    celestial: hasCelestial,
    clouds: hasCloud,
    rain: hasRain,
    lightning: hasLightning,
    snow: hasSnow,
  };

  const celestial: WeatherEffectsCanvasProps["celestial"] = hasCelestial
    ? custom.celestial
    : undefined;

  const cloud: WeatherEffectsCanvasProps["cloud"] =
    hasCloud && custom.cloud
      ? {
          coverage: custom.cloud.coverage,
          density: custom.cloud.density,
          softness: custom.cloud.softness,
          cloudScale: custom.cloud.cloudScale,
          windSpeed: custom.cloud.windSpeed,
          windAngle: custom.cloud.windAngle,
          turbulence: custom.cloud.turbulence,
          lightIntensity:
            custom.cloud.lightIntensity ??
            sunAltitudeToLightIntensity(custom.cloud.sunAltitude),
          ambientDarkness: custom.cloud.ambientDarkness,
          numLayers: custom.cloud.numLayers,
        }
      : undefined;

  const rain: WeatherEffectsCanvasProps["rain"] =
    hasRain && custom.rain
      ? {
          glassIntensity: custom.rain.glassIntensity,
          glassZoom: custom.rain.zoom,
          fallingIntensity: custom.rain.fallingIntensity,
          fallingSpeed: custom.rain.fallingSpeed,
          fallingAngle: custom.rain.fallingAngle,
          fallingStreakLength: custom.rain.fallingStreakLength,
          fallingLayers: custom.rain.fallingLayers,
        }
      : undefined;

  const lightning: WeatherEffectsCanvasProps["lightning"] =
    hasLightning && custom.lightning
      ? {
          enabled: true,
          autoMode: custom.lightning.autoMode,
          autoInterval: custom.lightning.autoInterval,
          flashIntensity: custom.lightning.glowIntensity,
          branchDensity: custom.lightning.branchDensity,
        }
      : undefined;

  const snow: WeatherEffectsCanvasProps["snow"] =
    hasSnow && custom.snow
      ? {
          intensity: custom.snow.intensity,
          layers: custom.snow.layers,
          fallSpeed: custom.snow.fallSpeed,
          windSpeed: custom.snow.windSpeed,
          drift: custom.snow.drift,
          flakeSize: custom.snow.flakeSize,
        }
      : undefined;

  const interactions: Partial<
    NonNullable<WeatherEffectsCanvasProps["interactions"]>
  > = {};
  if (custom.rain?.fallingRefraction !== undefined) {
    interactions.rainRefractionStrength = custom.rain.fallingRefraction;
  }
  if (custom.lightning?.sceneIllumination !== undefined) {
    interactions.lightningSceneIllumination =
      custom.lightning.sceneIllumination;
  }

  return {
    layers,
    celestial,
    cloud,
    rain,
    lightning,
    snow,
    interactions:
      Object.keys(interactions).length > 0 ? interactions : undefined,
    post: custom.post,
  };
}

/**
 * Custom effect layer props for direct control.
 * When provided, these override the auto-calculated values from mapWeatherToEffects.
 */
export type WeatherEffectLayer =
  | "celestial"
  | "clouds"
  | "rain"
  | "lightning"
  | "snow";

export interface CustomEffectProps {
  enabledLayers?: WeatherEffectLayer[];
  celestial?: {
    timeOfDay: number;
    moonPhase: number;
    starDensity: number;
    celestialX: number;
    celestialY: number;
    sunSize: number;
    moonSize: number;
    sunGlowIntensity: number;
    sunGlowSize: number;
    sunRayCount: number;
    sunRayLength: number;
    sunRayIntensity: number;
    /**
     * Scales subtle, noise-driven ray motion (shimmer + slow "breathing").
     * 0 disables motion; 1 is the default subtlety; >1 increases visibility.
     */
    sunRayShimmer?: number;
    /**
     * Global speed multiplier for the ray shimmer/breath noise inputs.
     * 1 is the default speed; >1 speeds up motion.
     */
    sunRayShimmerSpeed?: number;
    moonGlowIntensity: number;
    moonGlowSize: number;
  };
  cloud?: {
    cloudScale?: number;
    coverage: number;
    density?: number;
    softness?: number;
    windSpeed: number;
    windAngle?: number;
    turbulence: number;
    sunAltitude: number;
    sunAzimuth?: number;
    lightIntensity?: number;
    ambientDarkness: number;
    numLayers?: number;
    layerSpread?: number;
    starDensity: number;
    starSize?: number;
    starTwinkleSpeed?: number;
    starTwinkleAmount?: number;
    horizonLine?: number;
  };
  rain?: {
    glassIntensity: number;
    zoom?: number;
    fallingIntensity: number;
    fallingSpeed?: number;
    fallingAngle: number;
    fallingStreakLength?: number;
    fallingLayers?: number;
    fallingRefraction?: number;
    fallingWaviness?: number;
    fallingThicknessVar?: number;
  };
  lightning?: {
    branchDensity?: number;
    displacement?: number;
    glowIntensity?: number;
    flashDuration?: number;
    sceneIllumination?: number;
    afterglowPersistence?: number;
    autoMode: boolean;
    autoInterval: number;
  };
  snow?: {
    intensity: number;
    layers?: number;
    fallSpeed?: number;
    windSpeed: number;
    windAngle?: number;
    turbulence?: number;
    drift: number;
    flutter?: number;
    windShear?: number;
    flakeSize?: number;
    sizeVariation?: number;
    opacity?: number;
    glowAmount?: number;
    sparkle?: number;
    visibility?: number;
  };
  glass?: {
    enabled?: boolean;
    depth?: number;
    strength?: number;
    chromaticAberration?: number;
    blur?: number;
    brightness?: number;
    saturation?: number;
  };

  /**
   * Post-processing overrides (applied in the final composite pass).
   * These are intended for “air + camera” controls like haze, bloom, exposure,
   * and crepuscular rays.
   */
  post?: {
    enabled?: boolean;

    haze?: number;
    hazeHorizon?: number;
    hazeDesaturation?: number;
    hazeContrast?: number;

    bloomIntensity?: number;
    bloomThreshold?: number;
    bloomKnee?: number;
    bloomRadius?: number;
    bloomTapScale?: number;

    exposureIntensity?: number;
    exposureDesaturation?: number;
    exposureRecovery?: number;

    godRayIntensity?: number;
    godRayDecay?: number;
    godRayDensity?: number;
    godRayWeight?: number;
    godRaySamples?: number;
  };
}

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
    () => resolveQuality(settings?.quality ?? "auto"),
    [settings?.quality],
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dpr = useMemo(() => {
    if (typeof window === "undefined") return undefined;

    const base = window.devicePixelRatio || 1;
    // Keep high-density screens from exploding GPU cost by default.
    const cap =
      resolvedQuality === "low"
        ? 1.0
        : resolvedQuality === "medium"
          ? 1.5
          : 2.0;

    return Math.max(1, Math.min(base, cap));
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
