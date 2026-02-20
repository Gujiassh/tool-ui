import type { ComponentId } from "./component-ids";

const COMPONENT_SYMBOL_OVERRIDES: Partial<Record<ComponentId, string>> = {
  "linkedin-post": "LinkedInPost",
  "x-post": "XPost",
};

const COMPONENT_IMPORT_PATH_OVERRIDES: Partial<Record<ComponentId, string>> = {
  "weather-widget": "@/components/tool-ui/weather-widget/runtime",
};

function toPascalCase(value: string): string {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

function getComponentSymbol(componentId: ComponentId): string {
  return COMPONENT_SYMBOL_OVERRIDES[componentId] ?? toPascalCase(componentId);
}

function getComponentImportPath(componentId: ComponentId): string {
  return (
    COMPONENT_IMPORT_PATH_OVERRIDES[componentId] ??
    `@/components/tool-ui/${componentId}`
  );
}

export function withComponentImport(componentId: ComponentId, code: string): string {
  const trimmedStart = code.trimStart();
  if (trimmedStart.startsWith("import ")) {
    return code;
  }

  const symbol = getComponentSymbol(componentId);
  const path = getComponentImportPath(componentId);
  return `import { ${symbol} } from "${path}";\n\n${code}`;
}
