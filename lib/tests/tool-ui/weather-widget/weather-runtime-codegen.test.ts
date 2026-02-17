// @vitest-environment node

import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES,
} from "@/lib/weather-authoring/weather-widget/effects/generated/tuned-presets.generated";
import * as generatedShaders from "@/lib/weather-authoring/weather-widget/effects/generated/weather-effect-shaders.generated";
import {
  canonicalizeWeatherPresetData,
  getStaleWeatherRuntimeArtifacts,
  loadWeatherAuthoringPreset,
  loadWeatherAuthoringShaders,
  minifyWeatherShaderSource,
} from "@/lib/weather-codegen/compile-weather-runtime";

const PROJECT_ROOT = process.cwd();
const SHADER_EXPORT_NAMES = [
  "FULLSCREEN_VERTEX",
  "CELESTIAL_FRAGMENT",
  "CLOUD_FRAGMENT",
  "RAIN_FRAGMENT",
  "LIGHTNING_FRAGMENT",
  "SNOW_FRAGMENT",
  "COMPOSITE_FRAGMENT",
] as const;

describe("weather runtime codegen", () => {
  test("bundled runtime does not reference removed component asset paths", () => {
    const bundledRuntimePath = path.join(
      PROJECT_ROOT,
      "components/tool-ui/weather-widget/generated/weather-runtime-core.generated.js",
    );
    const bundledRuntime = readFileSync(bundledRuntimePath, "utf8");

    expect(bundledRuntime).not.toContain("../assets/moon-texture.jpg");
  });

  test("generated artifacts are not stale", async () => {
    await expect(getStaleWeatherRuntimeArtifacts(PROJECT_ROOT)).resolves.toEqual(
      [],
    );
  });

  test("generated presets match canonicalized authoring source", () => {
    const authoringPreset = loadWeatherAuthoringPreset(PROJECT_ROOT);

    expect(TUNED_WEATHER_EFFECTS_CHECKPOINT_OVERRIDES).toEqual(
      canonicalizeWeatherPresetData(authoringPreset),
    );
  });

  test("generated shader module matches minified authoring sources", () => {
    const authoringShaders = loadWeatherAuthoringShaders(PROJECT_ROOT);
    const shaderExports = generatedShaders as Record<string, string>;

    for (const exportName of SHADER_EXPORT_NAMES) {
      expect(shaderExports[exportName]).toBe(
        minifyWeatherShaderSource(authoringShaders[exportName]),
      );
    }
  });
});
