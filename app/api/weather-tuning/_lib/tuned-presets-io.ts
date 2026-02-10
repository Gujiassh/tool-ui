import { readFile } from "fs/promises";
import path from "path";

import type { WeatherEffectsTunedPresets } from "../../../../components/tool-ui/weather-widget/effects/tuning";

export const TOOL_UI_TUNED_PRESETS_PATH = path.join(
  process.cwd(),
  "components/tool-ui/weather-widget/effects/tuned-presets.ts",
);

function stripLineComments(input: string): string {
  return input.replace(/\/\/.*$/gm, "");
}

export async function readToolUiTunedPresetsFromDisk(): Promise<WeatherEffectsTunedPresets> {
  const source = await readFile(TOOL_UI_TUNED_PRESETS_PATH, "utf8");
  const marker = "export const TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES";
  const markerIndex = source.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error("Missing TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES export.");
  }

  const equalsIndex = source.indexOf("=", markerIndex);
  if (equalsIndex === -1) {
    throw new Error("Missing '=' for tuned presets export.");
  }

  const firstBrace = source.indexOf("{", equalsIndex);
  if (firstBrace === -1) {
    throw new Error("Missing '{' for tuned presets object.");
  }

  const lastObjectEnd = source.lastIndexOf("};");
  if (lastObjectEnd === -1 || lastObjectEnd < firstBrace) {
    throw new Error("Missing '};' terminator for tuned presets export.");
  }

  const objectLiteral = stripLineComments(
    source.slice(firstBrace, lastObjectEnd + 1),
  );

  // The file is generated and should contain a plain object literal.
  // Evaluate it in a fresh Function scope (no external bindings).
  return Function(`"use strict"; return (${objectLiteral});`)() as WeatherEffectsTunedPresets;
}
