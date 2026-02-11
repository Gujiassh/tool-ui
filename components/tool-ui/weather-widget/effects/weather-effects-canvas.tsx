"use client";

import {
  __resetWeatherWebglCanvasBudgetForTests,
  getAllocatedWeatherWebglCanvasCount,
  getMaxConcurrentWeatherWebglCanvases,
  releaseWeatherWebglBudgetSlotOnInitFailure,
  releaseWeatherWebglCanvasBudgetSlot,
  setMaxConcurrentWeatherWebglCanvases,
  tryAcquireWeatherWebglCanvasBudgetSlot,
} from "./weather-webgl-budget";
import { useWeatherEffectsRenderer } from "./use-weather-effects-renderer";
import { resolveWeatherEffectsCanvasRuntimeProps } from "./weather-effects-props";
import type { WeatherEffectsCanvasProps } from "./weather-effects-types";

export type {
  CelestialParams,
  CloudParams,
  InteractionParams,
  LayerToggles,
  LightningParams,
  PostProcessParams,
  RainParams,
  SnowParams,
  WeatherEffectsCanvasProps,
} from "./weather-effects-types";

export {
  __resetWeatherWebglCanvasBudgetForTests,
  getAllocatedWeatherWebglCanvasCount,
  getMaxConcurrentWeatherWebglCanvases,
  releaseWeatherWebglBudgetSlotOnInitFailure,
  releaseWeatherWebglCanvasBudgetSlot,
  setMaxConcurrentWeatherWebglCanvases,
  tryAcquireWeatherWebglCanvasBudgetSlot,
};

export function WeatherEffectsCanvas({
  className,
  dpr,
  layers,
  celestial,
  cloud,
  rain,
  lightning,
  snow,
  interactions,
  post,
}: WeatherEffectsCanvasProps) {
  const canvasRef = useWeatherEffectsRenderer(
    resolveWeatherEffectsCanvasRuntimeProps({
      dpr,
      layers,
      celestial,
      cloud,
      rain,
      lightning,
      snow,
      interactions,
      post,
    }),
  );

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
