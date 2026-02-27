import {
  mapWeatherCompositorParamsToCanvasProps,
  type WeatherStudioCompositorParams,
  type WeatherEffectsCanvasProps,
} from "@/lib/weather-authoring/weather-widget/effects";
import type { FullCompositorParams } from "../../weather-compositor/presets";

/**
 * Convert tuning-studio compositor params (the superset used by the studio)
 * into the exact prop shape the shipping `WeatherEffectsCanvas` understands.
 *
 * Keeping this mapping centralized prevents "looks wrong / looks like bleed"
 * issues caused by inconsistent field names (e.g. `zoom` vs `glassZoom`) or
 * missing enable flags (e.g. lightning `enabled`).
 */
export function mapCompositorParamsToCanvasProps(
  params: FullCompositorParams,
): WeatherEffectsCanvasProps {
  return mapWeatherCompositorParamsToCanvasProps(
    params as WeatherStudioCompositorParams,
  );
}
