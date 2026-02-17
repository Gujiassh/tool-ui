import path from "node:path";
import { promises as fs } from "node:fs";

import { describe, expect, it } from "vitest";

const WEATHER_WIDGET_ROOT = "components/tool-ui/weather-widget";
const WEATHER_WIDGET_REGISTRY_PATH = "public/r/weather-widget.json";
const IGNORED_FILE_NAMES = new Set([".DS_Store", "Thumbs.db"]);

interface RegistryFileEntry {
  path: string;
}

interface RegistryItemPayload {
  files: RegistryFileEntry[];
}

async function listFilesRecursively(relativeDir: string): Promise<string[]> {
  const entries = await fs.readdir(relativeDir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (IGNORED_FILE_NAMES.has(entry.name)) {
      continue;
    }

    const entryPath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(entryPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath.split(path.sep).join("/"));
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

describe("weather runtime directory contract", () => {
  it("keeps weather-widget directory aligned to shipped runtime allowlist", async () => {
    const [registryRaw, weatherWidgetFiles] = await Promise.all([
      fs.readFile(WEATHER_WIDGET_REGISTRY_PATH, "utf8"),
      listFilesRecursively(WEATHER_WIDGET_ROOT),
    ]);

    const registry = JSON.parse(registryRaw) as RegistryItemPayload;
    const expectedWeatherWidgetFiles = registry.files
      .map((file) => file.path)
      .filter((filePath) => filePath.startsWith(`${WEATHER_WIDGET_ROOT}/`))
      .sort((a, b) => a.localeCompare(b));

    expect(weatherWidgetFiles).toEqual(expectedWeatherWidgetFiles);
  });
});
