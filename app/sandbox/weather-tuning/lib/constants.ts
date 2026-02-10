import {
  TIME_CHECKPOINTS as TOOL_UI_TIME_CHECKPOINTS,
  TIME_CHECKPOINT_ORDER as TOOL_UI_TIME_CHECKPOINT_ORDER,
  type TimeCheckpoint,
} from "@/components/tool-ui/weather-widget/effects/tuning";

export const TIME_CHECKPOINTS: Record<
  TimeCheckpoint,
  { value: number; label: string }
> = {
  dawn: { value: TOOL_UI_TIME_CHECKPOINTS.dawn, label: "Dawn" },
  noon: { value: TOOL_UI_TIME_CHECKPOINTS.noon, label: "Noon" },
  dusk: { value: TOOL_UI_TIME_CHECKPOINTS.dusk, label: "Dusk" },
  midnight: { value: TOOL_UI_TIME_CHECKPOINTS.midnight, label: "Night" },
};

export const TIME_CHECKPOINT_ORDER: TimeCheckpoint[] =
  TOOL_UI_TIME_CHECKPOINT_ORDER;

export const STORAGE_KEY = "weather-tuning-state";
export const SESSION_KEY = "weather-tuning-workflow";

export const DEFAULT_TIME_OF_DAY = 0.5;
export const SNOW_FALL_SPEED_MAX = 8;

export const RAIN_PARAM_LIMITS = {
  glassIntensity: { min: 0, max: 2 },
  zoom: { min: 0.25, max: 4 },
  fallingIntensity: { min: 0, max: 2 },
  fallingSpeed: { min: 0.1, max: 8 },
  fallingAngle: { min: -1.25, max: 1.25 },
  fallingStreakLength: { min: 0.1, max: 4 },
  fallingLayers: { min: 1, max: 12 },
  fallingRefraction: { min: 0, max: 2 },
  fallingWaviness: { min: 0, max: 2 },
  fallingThicknessVar: { min: 0, max: 2 },
} as const;
