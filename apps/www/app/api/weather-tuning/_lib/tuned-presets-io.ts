import { readFile } from "fs/promises";
import path from "path";

import type { WeatherEffectsTunedPresets } from "../../../../lib/weather-authoring/weather-widget/effects/tuning";

export const TOOL_UI_TUNED_PRESETS_PATH = path.join(
  process.cwd(),
  "lib/weather-authoring/presets/tuned-presets.json",
);

export async function readToolUiTunedPresetsFromDisk(): Promise<WeatherEffectsTunedPresets> {
  const source = await readFile(TOOL_UI_TUNED_PRESETS_PATH, "utf8");
  return JSON.parse(source) as WeatherEffectsTunedPresets;
}
