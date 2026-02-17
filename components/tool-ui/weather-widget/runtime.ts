/**
 * Start here when wiring the Weather Widget in your app.
 *
 * Import `WeatherWidget` and the runtime types from this file for production use.
 * Reach for `index.tsx` only if you're actively working on authoring/debug internals.
 */
export { WeatherWidget } from "./weather-widget-container";
export {
  type WeatherWidgetPayload,
  type WeatherWidgetRuntimeProps as WeatherWidgetProps,
  type WeatherWidgetCurrent,
  type WeatherWidgetTime,
  type WeatherWidgetLocation,
  type WeatherConditionCode,
  type ForecastDay,
  type TemperatureUnit,
  type PrecipitationLevel,
} from "./schema-runtime";
