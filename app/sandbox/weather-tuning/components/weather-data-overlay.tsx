"use client";

// IMPORTANT:
// The tuning studio must use the exact same overlay as the production widget,
// otherwise you end up tuning against a different composition.
export {
  WeatherDataOverlay,
  type WeatherDataOverlayProps,
  type GlassEffectParams,
} from "@/lib/weather-authoring/weather-widget";

import type {
  ForecastDay,
  TemperatureUnit,
  WeatherConditionCode,
} from "@/lib/weather-authoring/weather-widget/schema";

export interface WeatherOverlayStubData {
  location: string;
  conditionCode: WeatherConditionCode;
  temperature: number;
  tempHigh: number;
  tempLow: number;
  forecast: ForecastDay[];
  unit: TemperatureUnit;
}

export function createWeatherOverlayStubData(
  conditionCode: WeatherConditionCode,
): WeatherOverlayStubData {
  return {
    location: "San Francisco, CA",
    conditionCode,
    temperature: 72,
    tempHigh: 78,
    tempLow: 65,
    forecast: [
      { label: "Today", tempMin: 65, tempMax: 78, conditionCode },
      { label: "Tue", tempMin: 64, tempMax: 77, conditionCode: "partly-cloudy" },
      { label: "Wed", tempMin: 62, tempMax: 75, conditionCode: "cloudy" },
      { label: "Thu", tempMin: 60, tempMax: 73, conditionCode: "rain" },
      { label: "Fri", tempMin: 63, tempMax: 76, conditionCode: "clear" },
    ],
    unit: "fahrenheit",
  };
}
