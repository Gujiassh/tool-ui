import {
  DEFAULT_CELESTIAL,
  DEFAULT_CLOUD,
  DEFAULT_INTERACTIONS,
  DEFAULT_LAYERS,
  DEFAULT_LIGHTNING,
  DEFAULT_POST,
  DEFAULT_RAIN,
  DEFAULT_SNOW,
} from "./weather-effects-defaults";
import type {
  ResolvedWeatherEffectsCanvasProps,
  WeatherEffectsCanvasProps,
} from "./weather-effects-types";

function mergeDefined<T extends object>(
  defaults: T,
  overrides: Partial<T> | undefined,
): T {
  if (!overrides) {
    return { ...defaults };
  }

  const merged = { ...defaults };
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const value = overrides[key];
    if (value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
}

export function resolveWeatherEffectsCanvasRuntimeProps(
  props: WeatherEffectsCanvasProps,
): ResolvedWeatherEffectsCanvasProps {
  return {
    layers: mergeDefined(DEFAULT_LAYERS, props.layers),
    celestial: mergeDefined(DEFAULT_CELESTIAL, props.celestial),
    cloud: mergeDefined(DEFAULT_CLOUD, props.cloud),
    rain: mergeDefined(DEFAULT_RAIN, props.rain),
    lightning: mergeDefined(DEFAULT_LIGHTNING, props.lightning),
    snow: mergeDefined(DEFAULT_SNOW, props.snow),
    interactions: mergeDefined(DEFAULT_INTERACTIONS, props.interactions),
    post: mergeDefined(DEFAULT_POST, props.post),
    dpr: props.dpr,
  };
}
