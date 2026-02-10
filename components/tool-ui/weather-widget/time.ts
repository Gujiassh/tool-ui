import { getTimeOfDay } from "./effects";
import type { WeatherWidgetVisual } from "./schema";

export interface ResolveWeatherVisualTimeInput {
  visual?: WeatherWidgetVisual;
  updatedAt?: string;
}

export type WeatherVisualTimeSource =
  | "timeBucket"
  | "localTimeOfDay"
  | "updatedAt"
  | "defaultNoon";

export interface ResolvedWeatherVisualTime {
  timeOfDay: number;
  source: WeatherVisualTimeSource;
}

function normalizeTimeOfDay(value: number): number {
  const normalized = ((value % 1) + 1) % 1;
  return normalized;
}

export function timeBucketToTimeOfDay(timeBucket: number): number {
  const normalizedBucket = ((Math.floor(timeBucket) % 12) + 12) % 12;
  return (normalizedBucket + 0.5) / 12;
}

export function resolveWeatherVisualTime(
  input: ResolveWeatherVisualTimeInput,
): ResolvedWeatherVisualTime {
  const { visual, updatedAt } = input;

  if (typeof visual?.timeBucket === "number") {
    return {
      timeOfDay: timeBucketToTimeOfDay(visual.timeBucket),
      source: "timeBucket",
    };
  }

  if (typeof visual?.localTimeOfDay === "number") {
    return {
      timeOfDay: normalizeTimeOfDay(visual.localTimeOfDay),
      source: "localTimeOfDay",
    };
  }

  if (typeof updatedAt === "string") {
    return {
      timeOfDay: getTimeOfDay(updatedAt),
      source: "updatedAt",
    };
  }

  return {
    timeOfDay: 0.5,
    source: "defaultNoon",
  };
}
