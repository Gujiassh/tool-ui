import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import type {
  FullCompositorParams,
  CheckpointOverrides,
} from "../presets";
import {
  WEATHER_CONDITIONS,
  extractOverrides,
  getBaseParamsForCondition,
} from "../presets";
import type {
  Curve,
  CurveMap,
  ParamId,
  WeatherTuningConfig,
} from "./tuning-schema";
import { TIME_CHECKPOINTS, TIME_CHECKPOINT_ORDER } from "@/components/tool-ui/weather-widget/effects/tuning";

export type ParamValue = number | boolean;
export interface ParamMeta {
  id: ParamId;
  group: keyof FullCompositorParams;
  key: string;
}

export interface ResolveParamsInput {
  config: WeatherTuningConfig;
  condition: WeatherCondition;
  timeOfDay: number;
  baseParams: FullCompositorParams;
  paramCatalog?: ParamMeta[];
}

const DEFAULT_EXCLUDES = new Set(["celestial.timeOfDay"]);

export function toParamId(group: string, key: string): ParamId {
  return `${group}.${key}`;
}

export function buildParamCatalogFromBase(
  base: FullCompositorParams,
  options?: { exclude?: string[] },
): ParamMeta[] {
  const exclude = new Set(options?.exclude ?? DEFAULT_EXCLUDES);
  const catalog: ParamMeta[] = [];

  (Object.keys(base) as (keyof FullCompositorParams)[]).forEach((groupKey) => {
    const group = base[groupKey];
    if (!group || typeof group !== "object") return;

    for (const key of Object.keys(group)) {
      const id = toParamId(groupKey, key);
      if (exclude.has(id)) continue;

      const value = (group as Record<string, unknown>)[key];
      if (typeof value !== "number" && typeof value !== "boolean") continue;

      catalog.push({
        id,
        group: groupKey,
        key,
      });
    }
  });

  return catalog;
}

export function resolveWeatherParams({
  config,
  condition,
  timeOfDay,
  baseParams,
  paramCatalog,
}: ResolveParamsInput): FullCompositorParams {
  const catalog = paramCatalog ?? buildParamCatalogFromBase(baseParams);
  const metaById = indexParamCatalog(catalog);

  const values: Record<ParamId, ParamValue> = {};

  // Seed with base params
  for (const meta of catalog) {
    values[meta.id] = getBaseValue(baseParams, meta);
  }

  const profile = config.conditions?.[condition];
  if (profile?.curves) {
    applyCurveMap(values, profile.curves, timeOfDay, metaById);
  }

  return materializeFromBase(baseParams, values, catalog);
}

export function curveConfigToCheckpointOverrides(
  config: WeatherTuningConfig,
  conditions: WeatherCondition[] = WEATHER_CONDITIONS,
): Partial<Record<WeatherCondition, CheckpointOverrides>> {
  const checkpointOverrides: Partial<
    Record<WeatherCondition, CheckpointOverrides>
  > = {};

  for (const condition of conditions) {
    const overrides: CheckpointOverrides = {
      dawn: {},
      noon: {},
      dusk: {},
      midnight: {},
    };

    let hasAny = false;

    for (const checkpoint of TIME_CHECKPOINT_ORDER) {
      const timeOfDay = TIME_CHECKPOINTS[checkpoint];
      const base = getBaseParamsForCondition(
        condition,
        getTimestamp(timeOfDay),
      );
      base.celestial.timeOfDay = timeOfDay;

      const resolved = resolveWeatherParams({
        config,
        condition,
        timeOfDay,
        baseParams: base,
      });

      const diff = extractOverrides(resolved, base);
      if (Object.keys(diff).length > 0) {
        overrides[checkpoint] = diff;
        hasAny = true;
      }
    }

    if (hasAny) {
      checkpointOverrides[condition] = overrides;
    }
  }

  return checkpointOverrides;
}

function indexParamCatalog(catalog: ParamMeta[]): Map<ParamId, ParamMeta> {
  const map = new Map<ParamId, ParamMeta>();
  for (const meta of catalog) {
    map.set(meta.id, meta);
  }
  return map;
}

function getBaseValue(base: FullCompositorParams, meta: ParamMeta): ParamValue {
  const group = base[meta.group] as Record<string, ParamValue>;
  return group[meta.key];
}

function materializeFromBase(
  base: FullCompositorParams,
  values: Record<ParamId, ParamValue>,
  catalog: ParamMeta[],
): FullCompositorParams {
  const next = structuredClone(base);

  for (const meta of catalog) {
    const value = values[meta.id];
    if (value === undefined) continue;
    const group = next[meta.group] as Record<string, ParamValue>;
    group[meta.key] = value;
  }

  return next;
}

function applyCurveMap(
  values: Record<ParamId, ParamValue>,
  curves: CurveMap | undefined,
  timeOfDay: number,
  metaById: Map<ParamId, ParamMeta>,
) {
  if (!curves) return;

  for (const [paramId, curve] of Object.entries(curves)) {
    const meta = metaById.get(paramId);
    if (!meta) continue;

    const sampled = sampleCurve(curve, timeOfDay);
    if (sampled === undefined) continue;
    values[paramId] = sampled;
  }
}

export function sampleCurve(
  curve: Curve,
  timeOfDay: number,
): ParamValue | undefined {
  const t = normalizeTime(timeOfDay);
  const EPS = 0.0001;

  for (const knot of curve.knots) {
    const diff = Math.abs(t - knot.t);
    const dist = Math.min(diff, 1 - diff);
    if (dist <= EPS) {
      return knot.value;
    }
  }

  return undefined;
}

function normalizeTime(timeOfDay: number): number {
  return ((timeOfDay % 1) + 1) % 1;
}

function getTimestamp(timeOfDay: number): string {
  const date = new Date();
  const hours = Math.floor(timeOfDay * 24);
  const minutes = Math.floor((timeOfDay * 24 - hours) * 60);
  date.setUTCHours(hours, minutes, 0, 0);
  return date.toISOString();
}
