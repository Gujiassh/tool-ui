import type { WeatherConditionCode } from "@/lib/weather-authoring/weather-widget/schema";
import type { ConditionOverrides } from "../weather-compositor/presets";

export type CheckpointStatus = "pending" | "reviewed";

export interface ConditionCheckpoints {
  dawn: CheckpointStatus;
  noon: CheckpointStatus;
  dusk: CheckpointStatus;
  midnight: CheckpointStatus;
}

export type CompareMode = "off" | "ab" | "side-by-side";

export interface TuningState {
  overrides: Partial<Record<WeatherConditionCode, ConditionOverrides>>;
  globalTimeOfDay: number;

  selectedCondition: WeatherConditionCode | null;
  expandedGroups: Set<string>;
  compareMode: CompareMode;
  compareTarget: WeatherConditionCode | null;
  showWidgetOverlay: boolean;

  checkpoints: Partial<Record<WeatherConditionCode, ConditionCheckpoints>>;
  signedOff: Set<WeatherConditionCode>;
}

export type { TimeCheckpoint } from "@/lib/weather-authoring/weather-widget/effects/tuning";
