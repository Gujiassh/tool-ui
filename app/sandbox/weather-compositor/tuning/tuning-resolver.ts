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
  CurveInterpolation,
} from "./tuning-schema";
import { TIME_CHECKPOINTS, TIME_CHECKPOINT_ORDER } from "@/components/tool-ui/weather-widget/effects/tuning";

export type ParamValue = number | boolean;
export type ParamType = "number" | "boolean";

export interface ParamMeta {
  id: ParamId;
  group: keyof FullCompositorParams;
  key: string;
  type: ParamType;
  clamp?: { min?: number; max?: number };
}

export interface ResolveParamsInput {
  config: WeatherTuningConfig;
  condition: WeatherCondition;
  timeOfDay: number;
  baseParams: FullCompositorParams;
  paramCatalog?: ParamMeta[];
  flags?: string[];
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
        type: typeof value,
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
  flags = [],
}: ResolveParamsInput): FullCompositorParams {
  const catalog = paramCatalog ?? buildParamCatalogFromBase(baseParams);
  const metaById = indexParamCatalog(catalog);

  const values: Record<ParamId, ParamValue> = {};

  // Seed with base params
  for (const meta of catalog) {
    values[meta.id] = getBaseValue(baseParams, meta);
  }

  applyCurveMap(values, config.global, timeOfDay, metaById);

  const chain = resolveConditionChain(condition, config.conditions ?? {});
  for (const cond of chain) {
    const profile = config.conditions?.[cond];
    if (profile?.curves) {
      applyCurveMap(values, profile.curves, timeOfDay, metaById);
    }
  }

  applySpecialCases(values, config.specialCases ?? [], {
    condition,
    timeOfDay,
    flags,
    metaById,
  });

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

function resolveConditionChain(
  condition: WeatherCondition,
  profiles: Partial<Record<WeatherCondition, { parent?: WeatherCondition }>>,
): WeatherCondition[] {
  const chain: WeatherCondition[] = [];
  const visited = new Set<WeatherCondition>();
  let current: WeatherCondition | undefined = condition;

  while (current) {
    if (visited.has(current)) {
      throw new Error(`Circular condition parent chain at ${current}`);
    }
    visited.add(current);
    chain.push(current);
    current = profiles[current]?.parent;
  }

  return chain.reverse();
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

    const sampled = sampleCurve(curve, timeOfDay, meta.type);
    if (curve.mode === "delta" && meta.type === "number") {
      const baseValue = values[paramId];
      const delta = typeof sampled === "number" ? sampled : 0;
      const base = typeof baseValue === "number" ? baseValue : 0;
      const next = base + delta;
      values[paramId] = clampValue(next, curve.clamp ?? meta.clamp);
    } else {
      values[paramId] = clampValue(sampled, curve.clamp ?? meta.clamp);
    }
  }
}

function applySpecialCases(
  values: Record<ParamId, ParamValue>,
  cases: Array<{
    when: {
      condition?: WeatherCondition;
      timeRange?: [number, number];
      flags?: string[];
    };
    curves: CurveMap;
    priority: number;
  }>,
  context: {
    condition: WeatherCondition;
    timeOfDay: number;
    flags: string[];
    metaById: Map<ParamId, ParamMeta>;
  },
) {
  const active = cases
    .filter((entry) => matchesCase(entry.when, context))
    .sort((a, b) => a.priority - b.priority);

  for (const entry of active) {
    applyCurveMap(values, entry.curves, context.timeOfDay, context.metaById);
  }
}

function matchesCase(
  when: {
    condition?: WeatherCondition;
    timeRange?: [number, number];
    flags?: string[];
  },
  context: { condition: WeatherCondition; timeOfDay: number; flags: string[] },
): boolean {
  if (when.condition && when.condition !== context.condition) return false;

  if (when.flags && when.flags.length > 0) {
    const missing = when.flags.filter((flag) => !context.flags.includes(flag));
    if (missing.length > 0) return false;
  }

  if (when.timeRange) {
    const [start, end] = when.timeRange;
    const t = normalizeTime(context.timeOfDay);

    if (start <= end) {
      if (t < start || t > end) return false;
    } else {
      if (t < start && t > end) return false;
    }
  }

  return true;
}

export function sampleCurve(
  curve: Curve,
  timeOfDay: number,
  type: ParamType,
): ParamValue {
  const knots = [...curve.knots].sort((a, b) => a.t - b.t);
  if (knots.length === 1) return knots[0].value as ParamValue;

  const t = normalizeTime(timeOfDay);

  let before = knots[0];
  let after = knots[0];
  let segmentT = 0;

  const index = knots.findIndex((k) => t < k.t);
  if (index === -1) {
    before = knots[knots.length - 1];
    after = knots[0];
    segmentT = computeSegmentT(t, before.t, after.t, true);
  } else if (index === 0) {
    before = knots[knots.length - 1];
    after = knots[0];
    segmentT = computeSegmentT(t, before.t, after.t, true);
  } else {
    before = knots[index - 1];
    after = knots[index];
    segmentT = computeSegmentT(t, before.t, after.t, false);
  }

  return interpolateValue(
    before.value,
    after.value,
    segmentT,
    curve.interpolation,
    type,
  );
}

function computeSegmentT(
  query: number,
  start: number,
  end: number,
  wraps: boolean,
): number {
  let adjustedEnd = end;
  let adjustedQuery = query;

  if (wraps && adjustedEnd <= start) {
    adjustedEnd += 1;
  }
  if (wraps && adjustedQuery < start) {
    adjustedQuery += 1;
  }

  const range = adjustedEnd - start;
  return range > 0 ? (adjustedQuery - start) / range : 0;
}

function normalizeTime(timeOfDay: number): number {
  return ((timeOfDay % 1) + 1) % 1;
}

function interpolateValue(
  fromVal: ParamValue,
  toVal: ParamValue,
  t: number,
  interpolation: CurveInterpolation | undefined,
  type: ParamType,
): ParamValue {
  if (type === "boolean" || interpolation === "step") {
    return t < 0.5 ? fromVal : toVal;
  }

  if (typeof fromVal === "number" && typeof toVal === "number") {
    const easedT = interpolation === "ease" ? smoothstep(t) : t;
    return fromVal + (toVal - fromVal) * easedT;
  }

  return t < 0.5 ? fromVal : toVal;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function clampValue(
  value: ParamValue,
  clamp?: { min?: number; max?: number },
): ParamValue {
  if (typeof value !== "number" || !clamp) return value;
  let next = value;
  if (typeof clamp.min === "number") next = Math.max(clamp.min, next);
  if (typeof clamp.max === "number") next = Math.min(clamp.max, next);
  return next;
}

function getTimestamp(timeOfDay: number): string {
  const date = new Date();
  const hours = Math.floor(timeOfDay * 24);
  const minutes = Math.floor((timeOfDay * 24 - hours) * 60);
  date.setUTCHours(hours, minutes, 0, 0);
  return date.toISOString();
}
