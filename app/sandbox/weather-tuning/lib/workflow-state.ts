import type { WeatherConditionCode } from "@/components/tool-ui/weather-widget/schema";
import type { CheckpointOverrides } from "../../weather-compositor/presets";
import type { ConditionCheckpoints } from "../types";
import { SESSION_KEY as LEGACY_WORKFLOW_STATE_STORAGE_KEY } from "./constants";

export const WORKFLOW_STATE_STORAGE_KEY = "weather-tuning-studio-session";
export const STORAGE_KEY = WORKFLOW_STATE_STORAGE_KEY;

export interface WorkflowState {
  checkpoints: Partial<Record<WeatherConditionCode, ConditionCheckpoints>>;
  signedOff: WeatherConditionCode[];
  repoCheckpointOverrides?: Partial<
    Record<WeatherConditionCode, CheckpointOverrides>
  >;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseWorkflowState(parsed: unknown): WorkflowState | null {
  if (!isRecord(parsed)) return null;

  const checkpoints = isRecord(parsed.checkpoints)
    ? (parsed.checkpoints as Partial<
        Record<WeatherConditionCode, ConditionCheckpoints>
      >)
    : {};

  const signedOff = Array.isArray(parsed.signedOff)
    ? parsed.signedOff.filter(
        (condition): condition is WeatherConditionCode =>
          typeof condition === "string",
      )
    : [];

  const repoCheckpointOverrides = isRecord(parsed.repoCheckpointOverrides)
    ? (parsed.repoCheckpointOverrides as Partial<
        Record<WeatherConditionCode, CheckpointOverrides>
      >)
    : undefined;

  if (repoCheckpointOverrides) {
    return {
      checkpoints,
      signedOff,
      repoCheckpointOverrides,
    };
  }

  return {
    checkpoints,
    signedOff,
  };
}

export function loadWorkflowState(): WorkflowState | null {
  if (typeof window === "undefined") return null;
  try {
    const stored =
      window.localStorage.getItem(WORKFLOW_STATE_STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_WORKFLOW_STATE_STORAGE_KEY);

    if (!stored) return null;
    return parseWorkflowState(JSON.parse(stored));
  } catch {
    return null;
  }
}

export function saveWorkflowState(state: WorkflowState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      WORKFLOW_STATE_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    console.warn("Failed to save workflow state to localStorage");
  }
}
