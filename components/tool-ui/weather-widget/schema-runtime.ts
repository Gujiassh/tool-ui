import type { EffectSettings } from "@/lib/weather-authoring/weather-widget/effects/types";
import type {
  ForecastDay,
  PrecipitationLevel,
  TemperatureUnit,
  WeatherConditionCode,
  WeatherWidgetCurrent,
  WeatherWidgetLocation,
  WeatherWidgetPayload,
  WeatherWidgetTime,
} from "@/lib/weather-authoring/weather-widget/schema";

export type {
  ForecastDay,
  PrecipitationLevel,
  TemperatureUnit,
  WeatherConditionCode,
  WeatherWidgetCurrent,
  WeatherWidgetLocation,
  WeatherWidgetPayload,
  WeatherWidgetTime,
};

export interface WeatherWidgetRuntimeProps extends WeatherWidgetPayload {
  className?: string;
  effects?: EffectSettings;
}
