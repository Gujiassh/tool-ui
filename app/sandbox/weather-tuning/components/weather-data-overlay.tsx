"use client";

// IMPORTANT:
// The tuning studio must use the exact same overlay as the production widget,
// otherwise you end up tuning against a different composition.
export {
  WeatherDataOverlay,
  type WeatherDataOverlayProps,
  type GlassEffectParams,
} from "@/components/tool-ui/weather-widget";

import type {
  ForecastDay,
  TemperatureUnit,
  WeatherCondition,
} from "@/components/tool-ui/weather-widget/schema";

export interface WeatherOverlayStubData {
  location: string;
  condition: WeatherCondition;
  temperature: number;
  tempHigh: number;
  tempLow: number;
  forecast: ForecastDay[];
  unit: TemperatureUnit;
}

export function createWeatherOverlayStubData(
  condition: WeatherCondition,
): WeatherOverlayStubData {
  return {
    location: "San Francisco, CA",
    condition,
    temperature: 72,
    tempHigh: 78,
    tempLow: 65,
    forecast: [
      { day: "Today", tempMin: 65, tempMax: 78, condition },
      { day: "Tue", tempMin: 64, tempMax: 77, condition: "partly-cloudy" },
      { day: "Wed", tempMin: 62, tempMax: 75, condition: "cloudy" },
      { day: "Thu", tempMin: 60, tempMax: 73, condition: "rain" },
      { day: "Fri", tempMin: 63, tempMax: 76, condition: "clear" },
    ],
    unit: "fahrenheit",
  };
}
