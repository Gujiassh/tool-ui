import { readFile, writeFile } from "fs/promises";
import path from "path";

import type { WeatherCondition } from "../../../../components/tool-ui/weather-widget/schema";
import type { CheckpointOverrides } from "../../../sandbox/weather-compositor/presets";
import {
  generateToolUiTypeScript,
  mergeTunedPresets,
  toToolUiDelta,
} from "../../../sandbox/weather-tuning/lib/tool-ui-export";
import type { WeatherEffectsTunedPresets } from "../../../../components/tool-ui/weather-widget/effects/tuning";

export const runtime = "nodejs";

const OUTPUT_PATH = path.join(
  process.cwd(),
  "components/tool-ui/weather-widget/effects/tuned-presets.ts",
);

function stripLineComments(input: string): string {
  return input.replace(/\/\/.*$/gm, "");
}

async function readCurrentPresetsFromDisk(): Promise<WeatherEffectsTunedPresets> {
  const source = await readFile(OUTPUT_PATH, "utf8");
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
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${objectLiteral});`)() as WeatherEffectsTunedPresets;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Disabled in production.", { status: 403 });
  }

  let payload:
    | {
        checkpointOverrides?: Partial<
          Record<WeatherCondition, CheckpointOverrides>
        >;
        signedOff?: WeatherCondition[];
      }
    | null = null;
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return new Response("Invalid JSON payload.", { status: 400 });
  }

  if (!payload?.checkpointOverrides || typeof payload.checkpointOverrides !== "object") {
    return new Response("Missing 'checkpointOverrides' field.", { status: 400 });
  }

  const signedOff = new Set<WeatherCondition>(payload.signedOff ?? []);
  const delta = toToolUiDelta(payload.checkpointOverrides);
  if (Object.keys(delta).length === 0) {
    return new Response("No tuning changes to apply.", { status: 400 });
  }

  let base: WeatherEffectsTunedPresets;
  try {
    base = await readCurrentPresetsFromDisk();
  } catch (error) {
    console.warn("Failed to read current tuned presets; falling back to empty.", error);
    base = {};
  }

  const merged = mergeTunedPresets(base, delta);

  const content = generateToolUiTypeScript(merged, signedOff);
  await writeFile(OUTPUT_PATH, content, "utf8");
  return Response.json({
    ok: true,
    path: "components/tool-ui/weather-widget/effects/tuned-presets.ts",
  });
}
