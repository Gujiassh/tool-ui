/**
 * Start here when wiring the Weather Widget in your app.
 *
 * Import `WeatherWidget` and the runtime types from this file for production use.
 * Reach for `index.tsx` only if you're actively working on authoring/debug internals.
 */

export type {
  ForecastDay,
  PrecipitationLevel,
  TemperatureUnit,
  WeatherConditionCode,
  WeatherWidgetCurrent,
  WeatherWidgetLocation,
  WeatherWidgetPayload,
  WeatherWidgetRuntimeProps as WeatherWidgetProps,
  WeatherWidgetTime,
} from "./schema-runtime";
export { WeatherWidget } from "./weather-widget-container";
