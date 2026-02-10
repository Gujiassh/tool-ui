"use client";

import { cn, Card } from "./_adapter";
import {
  EffectCompositor,
  getSceneBrightnessFromTimeOfDay,
  getWeatherTheme,
  getNearestCheckpoint,
  TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
} from "./effects";
import type { WeatherWidgetProps } from "./schema";
import { resolveWeatherTime } from "./time";
import { WeatherDataOverlay } from "./weather-data-overlay";

function formatRelativeTime(isoString: string, locale?: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      -diffMinutes,
      "minute",
    );
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
      -diffHours,
      "hour",
    );
  }

  const diffDays = Math.floor(diffHours / 24);
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(
    -diffDays,
    "day",
  );
}

export function WeatherWidget({
  version: _version,
  id,
  location,
  units,
  current,
  forecast,
  time,
  updatedAt,
  className,
  locale: localeProp,
  effects,
  customEffectProps,
}: WeatherWidgetProps) {
  const locale =
    localeProp ??
    (typeof navigator !== "undefined" ? navigator.language : undefined);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const reducedMotion = effects?.reducedMotion ?? Boolean(prefersReducedMotion);
  const effectsEnabled = effects?.enabled !== false && !reducedMotion;

  const overlayTimeOfDay = customEffectProps?.celestial?.timeOfDay;
  const resolvedTime = resolveWeatherTime({
    time,
    updatedAt,
  });
  const timeOfDay =
    typeof overlayTimeOfDay === "number"
      ? overlayTimeOfDay
      : resolvedTime.timeOfDay;

  const tunedOverrides =
    TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES[current.conditionCode];
  const tunedGlass =
    tunedOverrides?.[getNearestCheckpoint(timeOfDay)]?.glass;
  const glassParams = customEffectProps?.glass
    ? { ...tunedGlass, ...customEffectProps.glass }
    : tunedGlass;
  const brightness = getSceneBrightnessFromTimeOfDay(timeOfDay, current.conditionCode);
  const weatherTheme = getWeatherTheme(brightness);
  const isWeatherDark = weatherTheme === "dark";
  const backgroundClass = isWeatherDark
    ? "bg-gradient-to-b from-zinc-950 via-zinc-900/70 to-zinc-950"
    : "bg-gradient-to-b from-sky-50 via-sky-100/70 to-white";

  const updatedAtLabel = updatedAt
    ? `Updated ${formatRelativeTime(updatedAt, locale)}`
    : undefined;

  return (
    <article
      data-slot="weather-widget"
      data-tool-ui-id={id}
      className={cn("w-full max-w-md", className)}
    >
      <Card
        className={cn(
          "@container/weather [container-type:size] relative overflow-clip aspect-[4/3] border-0 p-0 shadow-none",
          backgroundClass,
        )}
      >
        {effectsEnabled && (
          <EffectCompositor
            conditionCode={current.conditionCode}
            windSpeed={current.windSpeed}
            precipitationLevel={current.precipitationLevel}
            visibility={current.visibility}
            timestamp={updatedAt}
            timeOfDay={timeOfDay}
            settings={effects}
            customProps={customEffectProps}
          />
        )}

        <WeatherDataOverlay
          location={location.name}
          conditionCode={current.conditionCode}
          temperature={current.temperature}
          tempHigh={current.tempMax}
          tempLow={current.tempMin}
          forecast={forecast}
          unit={units.temperature}
          updatedAtLabel={updatedAtLabel}
          timeOfDay={timeOfDay}
          timestamp={updatedAt}
          glassParams={glassParams}
        />
      </Card>
    </article>
  );
}
