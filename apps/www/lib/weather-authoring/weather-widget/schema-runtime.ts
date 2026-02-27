import type { EffectSettings } from "./effects/types";
import type {
  ForecastDay,
  PrecipitationLevel,
  TemperatureUnit,
  WeatherConditionCode,
  WeatherWidgetCurrent,
  WeatherWidgetLocation,
  WeatherWidgetPayload,
  WeatherWidgetTime,
} from "./schema";

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
