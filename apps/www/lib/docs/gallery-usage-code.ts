import type { ComponentId } from "./component-ids";
import type { GalleryComponentDocId } from "./gallery-component-docs";
import { getPreviewConfig } from "./preview-config";

function toPascalCase(kebab: string): string {
  return kebab
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

const IMPORT_OVERRIDES: Partial<Record<GalleryComponentDocId, string>> = {
  citation: 'import { CitationList } from "@/components/tool-ui/citation"',
  "weather-widget":
    'import { WeatherWidget } from "@/components/tool-ui/weather-widget/runtime"',
};

/**
 * Returns the import statement for a Tool UI component. Use when displaying
 * code examples so users can copy a complete snippet.
 */
export function getImportLine(
  componentId: GalleryComponentDocId | ComponentId,
): string {
  const override = IMPORT_OVERRIDES[componentId as GalleryComponentDocId];
  if (override) return override;
  const name = toPascalCase(componentId);
  return `import { ${name} } from "@/components/tool-ui/${componentId}"`;
}

/**
 * Returns usage code (import + example) for a gallery component, or null if not available.
 */
export function getGalleryUsageCode(
  componentId: GalleryComponentDocId,
): string | null {
  const config = getPreviewConfig(componentId as ComponentId);
  if (!config) return null;

  const preset = config.presets[config.defaultPreset];
  if (!preset || typeof preset.generateExampleCode !== "function") return null;

  const body = preset.generateExampleCode(preset.data);
  const importLine = getImportLine(componentId);

  return `${importLine}\n\nexport function Example() {\n  return (\n    ${body}\n  )\n}`;
}
