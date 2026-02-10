"use client";

import type { WeatherConditionCode } from "@/components/tool-ui/weather-widget/schema";
import { WEATHER_CONDITIONS } from "../../weather-compositor/presets";
import { ConditionCard } from "./condition-card";
import type { ConditionCheckpoints } from "../types";

interface ConditionMatrixProps {
  selectedCondition: WeatherConditionCode | null;
  signedOff: Set<WeatherConditionCode>;
  checkpoints: Partial<Record<WeatherConditionCode, ConditionCheckpoints>>;
  getOverrideCount: (condition: WeatherConditionCode) => number;
  onSelectCondition: (condition: WeatherConditionCode) => void;
}

export function ConditionMatrix({
  selectedCondition,
  signedOff,
  checkpoints,
  getOverrideCount,
  onSelectCondition,
}: ConditionMatrixProps) {
  return (
    <div className="-mx-6 overflow-x-auto px-6">
      <div className="flex gap-2 pb-2">
        {WEATHER_CONDITIONS.map((condition) => (
          <ConditionCard
            key={condition}
            condition={condition}
            isSelected={selectedCondition === condition}
            isSignedOff={signedOff.has(condition)}
            checkpoints={checkpoints[condition]}
            overrideCount={getOverrideCount(condition)}
            onClick={() => onSelectCondition(condition)}
          />
        ))}
      </div>
    </div>
  );
}
