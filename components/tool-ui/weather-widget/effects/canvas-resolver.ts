import type { WeatherConditionCode } from "../schema";
import {
  getTimeOfDay,
  mapWeatherToEffects,
} from "./parameter-mapper";
import type { WeatherEffectParams } from "./types";
import {
  applyWeatherEffectsOverrides,
  getNearestCheckpoint,
  TIME_CHECKPOINTS,
  TIME_CHECKPOINT_ORDER,
  type TimeCheckpoint,
  type WeatherEffectsCheckpointOverrides,
  type WeatherEffectsOverrides,
  type WeatherEffectsTunedPresets,
} from "./tuning";
import type {
  CloudParams,
  InteractionParams,
  LayerToggles,
  LightningParams,
  PostProcessParams,
  RainParams,
  SnowParams,
  WeatherEffectsCanvasProps,
} from "./weather-effects-canvas";

export type WeatherEffectsCheckpointMode = "nearest" | "interpolated";

export interface ResolveWeatherEffectsCanvasPropsInput extends WeatherEffectParams {
  tunedPresets?: WeatherEffectsTunedPresets;
  checkpointMode?: WeatherEffectsCheckpointMode;
  /**
   * Optional explicit time-of-day (0-1) used for checkpoint blending.
   * When omitted, it is derived from `timestamp`.
   */
  timeOfDay?: number;
}

interface WeatherCompositorCelestialParams {
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
  sunRayShimmer: number;
  sunRayShimmerSpeed: number;
  moonGlowIntensity: number;
  moonGlowSize: number;
  skyBrightness: number;
  skySaturation: number;
  skyContrast: number;
}

interface WeatherCompositorCloudParams {
  cloudScale: number;
  coverage: number;
  density: number;
  softness: number;
  windSpeed: number;
  windAngle: number;
  turbulence: number;
  lightIntensity: number;
  ambientDarkness: number;
  backlightIntensity: number;
  numLayers: number;
}

interface WeatherCompositorRainParams {
  glassIntensity: number;
  zoom: number;
  fallingIntensity: number;
  fallingSpeed: number;
  fallingAngle: number;
  fallingStreakLength: number;
  fallingLayers: number;
  fallingRefraction: number;
}

interface WeatherCompositorLightningParams {
  autoMode: boolean;
  autoInterval: number;
  glowIntensity: number;
  branchDensity: number;
  sceneIllumination: number;
}

interface WeatherCompositorParams {
  layers: LayerToggles;
  celestial: WeatherCompositorCelestialParams;
  cloud: WeatherCompositorCloudParams;
  rain: WeatherCompositorRainParams;
  lightning: WeatherCompositorLightningParams;
  snow: SnowParams;
  post: PostProcessParams;
}

export interface WeatherStudioCompositorParams {
  layers: LayerToggles;
  celestial: WeatherCompositorCelestialParams;
  cloud: WeatherCompositorCloudParams;
  rain: WeatherCompositorRainParams;
  lightning: WeatherCompositorLightningParams;
  snow: SnowParams;
  post: PostProcessParams;
}

function createStudioTimestamp(
  timeOfDay: number,
  referenceTimestamp?: string,
): string {
  const reference = referenceTimestamp
    ? new Date(referenceTimestamp)
    : new Date();
  const date = new Date(reference);
  date.setUTCFullYear(2000, 0, 1);

  const hours = Math.floor(timeOfDay * 24);
  const minutes = Math.floor((timeOfDay * 24 - hours) * 60);

  date.setUTCHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function buildCompositorBaseFromWeather(
  params: WeatherEffectParams & { timeOfDay?: number },
): WeatherCompositorParams {
  const effectConfig = mapWeatherToEffects(params);
  const timeOfDay =
    params.timeOfDay ??
    effectConfig.celestial?.timeOfDay ??
    getTimeOfDay(params.timestamp);

  const hasCloud = effectConfig.cloud !== undefined;
  const hasRain = effectConfig.rain !== undefined;
  const hasLightning = effectConfig.lightning !== undefined;
  const hasSnow = effectConfig.snow !== undefined;

  const lightningIntervalMin = effectConfig.lightning?.intervalMin ?? 4;
  const lightningIntervalMax = effectConfig.lightning?.intervalMax ?? 12;

  return {
    layers: {
      celestial: true,
      clouds: hasCloud,
      rain: hasRain,
      lightning: hasLightning,
      snow: hasSnow,
    },
    celestial: {
      timeOfDay,
      moonPhase: effectConfig.celestial?.moonPhase ?? 0.5,
      starDensity: effectConfig.celestial?.starDensity ?? 0.5,
      celestialX: effectConfig.celestial?.celestialX ?? 0.5,
      celestialY: effectConfig.celestial?.celestialY ?? 0.72,
      sunSize: effectConfig.celestial?.sunSize ?? 0.06,
      moonSize: effectConfig.celestial?.moonSize ?? 0.05,
      sunGlowIntensity: effectConfig.celestial?.sunGlowIntensity ?? 1.0,
      sunGlowSize: effectConfig.celestial?.sunGlowSize ?? 0.3,
      sunRayCount: effectConfig.celestial?.sunRayCount ?? 12,
      sunRayLength: effectConfig.celestial?.sunRayLength ?? 0.5,
      sunRayIntensity: effectConfig.celestial?.sunRayIntensity ?? 0.4,
      sunRayShimmer: 1.0,
      sunRayShimmerSpeed: 1.0,
      moonGlowIntensity: effectConfig.celestial?.moonGlowIntensity ?? 1.0,
      moonGlowSize: effectConfig.celestial?.moonGlowSize ?? 0.2,
      skyBrightness: 1.0,
      skySaturation: 1.0,
      skyContrast: 1.0,
    },
    cloud: {
      cloudScale: 1.5,
      coverage: effectConfig.cloud?.coverage ?? 0.5,
      density: 0.7,
      softness: 0.3,
      windSpeed: effectConfig.cloud?.speed ?? 0.5,
      windAngle: 0,
      turbulence: effectConfig.cloud?.turbulence ?? 0.5,
      lightIntensity: 1.0,
      ambientDarkness: effectConfig.cloud?.darkness ?? 0.3,
      backlightIntensity: 0.5,
      numLayers: 3,
    },
    rain: {
      glassIntensity: hasRain ? (effectConfig.rain?.intensity ?? 0.5) * 0.7 : 0,
      zoom: 1.0,
      fallingIntensity: hasRain ? (effectConfig.rain?.intensity ?? 0.6) : 0,
      fallingSpeed: 1.0,
      fallingAngle: hasRain ? (effectConfig.rain?.angle ?? 5) * 0.02 : 0.1,
      fallingStreakLength: 0.8,
      fallingLayers: 3,
      fallingRefraction: 0.3,
    },
    lightning: {
      autoMode: hasLightning
        ? (effectConfig.lightning?.autoTrigger ?? true)
        : false,
      autoInterval: hasLightning
        ? (lightningIntervalMin + lightningIntervalMax) / 2
        : 8,
      glowIntensity: 0.8,
      branchDensity: 0.6,
      sceneIllumination: 0.6,
    },
    snow: {
      intensity: hasSnow ? (effectConfig.snow?.intensity ?? 0.7) : 0,
      layers: 4,
      fallSpeed: 0.5,
      windSpeed: hasSnow ? (effectConfig.snow?.windDrift ?? 0.3) : 0.3,
      windAngle: 0,
      turbulence: 0.3,
      drift: hasSnow ? (effectConfig.snow?.windDrift ?? 0.3) : 0.3,
      flutter: 0.5,
      windShear: 0.2,
      flakeSize: 1.0,
      sizeVariation: 0.5,
      opacity: 0.8,
      glowAmount: 0.3,
      sparkle: 0.2,
    },
    post: {
      enabled: true,
      haze: 0,
      hazeHorizon: 0.5,
      hazeDesaturation: 0.3,
      hazeContrast: 0.2,
      bloomIntensity: 0,
      bloomThreshold: 0.8,
      bloomKnee: 0.5,
      bloomRadius: 8,
      bloomTapScale: 1,
      exposureIntensity: 0,
      exposureDesaturation: 0.3,
      exposureRecovery: 2,
      godRayIntensity: 0,
      godRayDecay: 0.96,
      godRayDensity: 0.5,
      godRayWeight: 0.3,
      godRaySamples: 60,
    },
  };
}

export function mapWeatherCompositorParamsToCanvasProps(
  params: WeatherStudioCompositorParams,
): WeatherEffectsCanvasProps {
  return {
    layers: params.layers,
    celestial: {
      timeOfDay: params.celestial.timeOfDay,
      moonPhase: params.celestial.moonPhase,
      starDensity: params.celestial.starDensity,
      celestialX: params.celestial.celestialX,
      celestialY: params.celestial.celestialY,
      sunSize: params.celestial.sunSize,
      moonSize: params.celestial.moonSize,
      sunGlowIntensity: params.celestial.sunGlowIntensity,
      sunGlowSize: params.celestial.sunGlowSize,
      sunRayCount: params.celestial.sunRayCount,
      sunRayLength: params.celestial.sunRayLength,
      sunRayIntensity: params.celestial.sunRayIntensity,
      sunRayShimmer: params.celestial.sunRayShimmer,
      sunRayShimmerSpeed: params.celestial.sunRayShimmerSpeed,
      moonGlowIntensity: params.celestial.moonGlowIntensity,
      moonGlowSize: params.celestial.moonGlowSize,
      skyBrightness: params.celestial.skyBrightness,
      skySaturation: params.celestial.skySaturation,
      skyContrast: params.celestial.skyContrast,
    },
    cloud: {
      coverage: params.cloud.coverage,
      density: params.cloud.density,
      softness: params.cloud.softness,
      cloudScale: params.cloud.cloudScale,
      windSpeed: params.cloud.windSpeed,
      windAngle: params.cloud.windAngle,
      turbulence: params.cloud.turbulence,
      lightIntensity: params.cloud.lightIntensity,
      ambientDarkness: params.cloud.ambientDarkness,
      backlightIntensity: params.cloud.backlightIntensity,
      numLayers: params.cloud.numLayers,
    },
    rain: {
      glassIntensity: params.rain.glassIntensity,
      glassZoom: params.rain.zoom,
      fallingIntensity: params.rain.fallingIntensity,
      fallingSpeed: params.rain.fallingSpeed,
      fallingAngle: params.rain.fallingAngle,
      fallingStreakLength: params.rain.fallingStreakLength,
      fallingLayers: params.rain.fallingLayers,
    },
    lightning: {
      enabled: params.layers.lightning,
      autoMode: params.lightning.autoMode,
      autoInterval: params.lightning.autoInterval,
      flashIntensity: params.lightning.glowIntensity,
      branchDensity: params.lightning.branchDensity,
    },
    snow: {
      intensity: params.snow.intensity,
      layers: params.snow.layers,
      fallSpeed: params.snow.fallSpeed,
      windSpeed: params.snow.windSpeed,
      windAngle: params.snow.windAngle,
      turbulence: params.snow.turbulence,
      drift: params.snow.drift,
      flutter: params.snow.flutter,
      windShear: params.snow.windShear,
      flakeSize: params.snow.flakeSize,
      sizeVariation: params.snow.sizeVariation,
      opacity: params.snow.opacity,
      glowAmount: params.snow.glowAmount,
      sparkle: params.snow.sparkle,
    },
    interactions: {
      rainRefractionStrength: params.rain.fallingRefraction,
      lightningSceneIllumination: params.lightning.sceneIllumination,
    },
    post: params.post,
  };
}

function buildCanvasBaseFromWeather(params: WeatherEffectParams): WeatherEffectsCanvasProps {
  return mapWeatherCompositorParamsToCanvasProps(
    buildCompositorBaseFromWeather(params),
  );
}

interface SurroundingCheckpoints {
  before: TimeCheckpoint;
  after: TimeCheckpoint;
  t: number;
}

function getSurroundingCheckpoints(timeOfDay: number): SurroundingCheckpoints {
  const checkpointTimes = TIME_CHECKPOINT_ORDER.map((checkpoint) => ({
    checkpoint,
    value: TIME_CHECKPOINTS[checkpoint],
  })).sort((a, b) => a.value - b.value);

  const normalized = ((timeOfDay % 1) + 1) % 1;

  for (let i = 0; i < checkpointTimes.length; i++) {
    const current = checkpointTimes[i];
    const next = checkpointTimes[(i + 1) % checkpointTimes.length];

    const start = current.value;
    let end = next.value;

    if (end < start) {
      end += 1;
    }

    let query = normalized;
    if (query < start && end > 1) {
      query += 1;
    }

    if (query >= start && query < end) {
      const range = end - start;
      const t = range > 0 ? (query - start) / range : 0;
      return {
        before: current.checkpoint,
        after: next.checkpoint,
        t,
      };
    }
  }

  return {
    before: "midnight",
    after: "dawn",
    t: 0,
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolatePartialObject<T extends object>(
  before: Partial<T> | undefined,
  after: Partial<T> | undefined,
  baseBefore: T | undefined,
  baseAfter: T | undefined,
  t: number,
): Partial<T> | undefined {
  if (!before && !after) return undefined;

  const result: Partial<T> = {};
  const keys = new Set([
    ...(before ? Object.keys(before) : []),
    ...(after ? Object.keys(after) : []),
  ]) as Set<keyof T>;

  for (const key of keys) {
    const beforeValue = before?.[key];
    const afterValue = after?.[key];

    if (beforeValue === undefined && afterValue === undefined) {
      continue;
    }

    let from = beforeValue;
    let to = afterValue;

    if (from === undefined && baseBefore) {
      from = baseBefore[key];
    }
    if (to === undefined && baseAfter) {
      to = baseAfter[key];
    }

    if (from === undefined || to === undefined) {
      result[key] = (from ?? to) as T[keyof T];
      continue;
    }

    if (typeof from === "number" && typeof to === "number") {
      result[key] = lerp(from, to, t) as T[keyof T];
      continue;
    }

    if (typeof from === "boolean") {
      result[key] = (t < 0.5 ? from : to) as T[keyof T];
      continue;
    }

    result[key] = (t < 0.5 ? from : to) as T[keyof T];
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function interpolateWeatherEffectsOverrides(
  before: WeatherEffectsOverrides | undefined,
  after: WeatherEffectsOverrides | undefined,
  baseBefore: WeatherEffectsCanvasProps | undefined,
  baseAfter: WeatherEffectsCanvasProps | undefined,
  t: number,
): WeatherEffectsOverrides | undefined {
  if (!before && !after) return undefined;

  const result: WeatherEffectsOverrides = {};

  const layers = interpolatePartialObject(
    before?.layers,
    after?.layers,
    baseBefore?.layers,
    baseAfter?.layers,
    t,
  );
  if (layers) result.layers = layers;

  const celestial = interpolatePartialObject(
    before?.celestial,
    after?.celestial,
    baseBefore?.celestial,
    baseAfter?.celestial,
    t,
  );
  if (celestial) result.celestial = celestial;

  const cloud = interpolatePartialObject(
    before?.cloud,
    after?.cloud,
    baseBefore?.cloud,
    baseAfter?.cloud,
    t,
  );
  if (cloud) result.cloud = cloud;

  const rain = interpolatePartialObject(
    before?.rain,
    after?.rain,
    baseBefore?.rain,
    baseAfter?.rain,
    t,
  );
  if (rain) result.rain = rain;

  const lightning = interpolatePartialObject(
    before?.lightning,
    after?.lightning,
    baseBefore?.lightning,
    baseAfter?.lightning,
    t,
  );
  if (lightning) result.lightning = lightning;

  const snow = interpolatePartialObject(
    before?.snow,
    after?.snow,
    baseBefore?.snow,
    baseAfter?.snow,
    t,
  );
  if (snow) result.snow = snow;

  const interactions = interpolatePartialObject(
    before?.interactions,
    after?.interactions,
    baseBefore?.interactions,
    baseAfter?.interactions,
    t,
  );
  if (interactions) result.interactions = interactions;

  const post = interpolatePartialObject(
    before?.post,
    after?.post,
    baseBefore?.post,
    baseAfter?.post,
    t,
  );
  if (post) result.post = post;

  return Object.keys(result).length > 0 ? result : undefined;
}

function resolveInterpolatedOverridesForTime(opts: {
  checkpointOverrides: WeatherEffectsCheckpointOverrides;
  timeOfDay: number;
  getBaseForCheckpoint: (checkpoint: TimeCheckpoint) => WeatherEffectsCanvasProps;
}): WeatherEffectsOverrides | undefined {
  const { before, after, t } = getSurroundingCheckpoints(opts.timeOfDay);

  return interpolateWeatherEffectsOverrides(
    opts.checkpointOverrides[before],
    opts.checkpointOverrides[after],
    opts.getBaseForCheckpoint(before),
    opts.getBaseForCheckpoint(after),
    t,
  );
}

function resolveBaseForCheckpoint(
  params: WeatherEffectParams,
  checkpoint: TimeCheckpoint,
): WeatherEffectsCanvasProps {
  const time = TIME_CHECKPOINTS[checkpoint];
  const timestamp = createStudioTimestamp(time, params.timestamp);
  return buildCanvasBaseFromWeather({
    ...params,
    timestamp,
  });
}

export function resolveWeatherEffectsCanvasProps(
  input: ResolveWeatherEffectsCanvasPropsInput,
): WeatherEffectsCanvasProps {
  const checkpointMode = input.checkpointMode ?? "nearest";
  const base = buildCanvasBaseFromWeather(input);
  const explicitTimeOfDay = input.timeOfDay;
  if (typeof explicitTimeOfDay === "number" && base.celestial) {
    base.celestial.timeOfDay = explicitTimeOfDay;
  }

  const conditionCheckpoints = input.tunedPresets?.[input.conditionCode];
  const timeOfDay = explicitTimeOfDay ?? base.celestial?.timeOfDay;
  if (!conditionCheckpoints || timeOfDay === undefined) {
    return base;
  }

  if (checkpointMode === "interpolated") {
    const interpolated = resolveInterpolatedOverridesForTime({
      checkpointOverrides: conditionCheckpoints,
      timeOfDay,
      getBaseForCheckpoint: (checkpoint) =>
        resolveBaseForCheckpoint(input, checkpoint),
    });

    return interpolated
      ? applyWeatherEffectsOverrides(base, interpolated)
      : base;
  }

  const checkpoint = getNearestCheckpoint(timeOfDay);
  return applyWeatherEffectsOverrides(base, conditionCheckpoints[checkpoint]);
}

export function resolveConditionCheckpointOverridesForTime(opts: {
  conditionCode: WeatherConditionCode;
  timeOfDay: number;
  tunedPresets: WeatherEffectsTunedPresets;
  checkpointMode?: WeatherEffectsCheckpointMode;
}): WeatherEffectsOverrides | undefined {
  const checkpointMode = opts.checkpointMode ?? "nearest";
  const conditionCheckpoints = opts.tunedPresets[opts.conditionCode];
  if (!conditionCheckpoints) return undefined;

  if (checkpointMode === "interpolated") {
    const { before, after, t } = getSurroundingCheckpoints(opts.timeOfDay);
    return interpolateWeatherEffectsOverrides(
      conditionCheckpoints[before],
      conditionCheckpoints[after],
      undefined,
      undefined,
      t,
    );
  }

  return conditionCheckpoints[getNearestCheckpoint(opts.timeOfDay)];
}

export type {
  CloudParams,
  InteractionParams,
  LightningParams,
  PostProcessParams,
  RainParams,
};
