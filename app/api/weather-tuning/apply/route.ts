import { writeFile } from "fs/promises";

import type { WeatherCondition } from "../../../../components/tool-ui/weather-widget/schema";
import type { CheckpointOverrides } from "../../../sandbox/weather-compositor/presets";
import {
  buildCanonicalToolUiPresetsForEditedConditions,
  generateToolUiTypeScript,
  replaceEditedConditions,
} from "../../../sandbox/weather-tuning/lib/tool-ui-export";
import type { WeatherEffectsTunedPresets } from "../../../../components/tool-ui/weather-widget/effects/tuning";
import {
  readToolUiTunedPresetsFromDisk,
  TOOL_UI_TUNED_PRESETS_PATH,
} from "../_lib/tuned-presets-io";
import { mapToolUiPresetsToCompositor } from "../../../sandbox/weather-tuning/lib/tool-ui-import";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Disabled in production.", { status: 403 });
  }

  type ApplyPayload = {
    checkpointOverrides?: Partial<Record<WeatherCondition, CheckpointOverrides>>;
    signedOff?: WeatherCondition[];
  };

  let payload: ApplyPayload | null = null;
  try {
    payload = (await request.json()) as ApplyPayload;
  } catch {
    return new Response("Invalid JSON payload.", { status: 400 });
  }

  if (!payload?.checkpointOverrides || typeof payload.checkpointOverrides !== "object") {
    return new Response("Missing 'checkpointOverrides' field.", { status: 400 });
  }

  const signedOff = new Set<WeatherCondition>(payload.signedOff ?? []);
  if (Object.keys(payload.checkpointOverrides).length === 0) {
    return new Response("No tuning changes to apply.", { status: 400 });
  }

  let base: WeatherEffectsTunedPresets;
  try {
    base = await readToolUiTunedPresetsFromDisk();
  } catch (error) {
    console.warn("Failed to read current tuned presets; falling back to empty.", error);
    base = {};
  }

  const repoCheckpointOverrides = mapToolUiPresetsToCompositor(base);
  const canonicalEditedConditions = buildCanonicalToolUiPresetsForEditedConditions(
    payload.checkpointOverrides,
    repoCheckpointOverrides,
  );

  if (Object.keys(canonicalEditedConditions).length === 0) {
    return new Response("No tuning changes to apply.", { status: 400 });
  }

  const merged = replaceEditedConditions(base, canonicalEditedConditions);

  const content = generateToolUiTypeScript(merged, signedOff);
  await writeFile(TOOL_UI_TUNED_PRESETS_PATH, content, "utf8");
  return Response.json({
    ok: true,
    path: "components/tool-ui/weather-widget/effects/tuned-presets.ts",
    checkpointOverrides: mapToolUiPresetsToCompositor(merged),
  });
}
