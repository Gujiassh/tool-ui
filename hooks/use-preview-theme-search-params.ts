"use client";

import { useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import {
  parseAsStringLiteral,
  type inferParserType,
  useQueryStates,
} from "nuqs";
import {
  buildPreviewThemeVars,
  DEFAULT_PREVIEW_THEME_CONFIG,
  normalizePreviewThemeConfig,
  PREVIEW_BASE_COLORS,
  PREVIEW_DENSITIES,
  PREVIEW_FONT_SCALES,
  PREVIEW_FONTS,
  PREVIEW_MENU_ACCENTS,
  PREVIEW_MENU_COLORS,
  PREVIEW_RADII,
  PREVIEW_SURFACE_TINTS,
  PREVIEW_THEMES,
  PREVIEW_THEME_PRESETS,
  resolveAvailableThemes,
  type PreviewThemeConfig,
} from "@/lib/docs/preview-theme-config";

const QUERY_STATE_OPTIONS = {
  history: "replace" as const,
  shallow: true,
  scroll: false,
};

const previewThemeSearchParamParsers = {
  previewBaseColor: parseAsStringLiteral(PREVIEW_BASE_COLORS)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewBaseColor)
    .withOptions({ clearOnDefault: false }),
  previewTheme: parseAsStringLiteral(PREVIEW_THEMES)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewTheme)
    .withOptions({ clearOnDefault: false }),
  previewRadius: parseAsStringLiteral(PREVIEW_RADII)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewRadius)
    .withOptions({ clearOnDefault: false }),
  previewDensity: parseAsStringLiteral(PREVIEW_DENSITIES)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewDensity)
    .withOptions({ clearOnDefault: false }),
  previewFontScale: parseAsStringLiteral(PREVIEW_FONT_SCALES)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewFontScale)
    .withOptions({ clearOnDefault: false }),
  previewSurfaceTint: parseAsStringLiteral(PREVIEW_SURFACE_TINTS)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewSurfaceTint)
    .withOptions({ clearOnDefault: false }),
  previewMenuAccent: parseAsStringLiteral(PREVIEW_MENU_ACCENTS)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewMenuAccent)
    .withOptions({ clearOnDefault: false }),
  previewMenuColor: parseAsStringLiteral(PREVIEW_MENU_COLORS)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewMenuColor)
    .withOptions({ clearOnDefault: false }),
  previewFont: parseAsStringLiteral(PREVIEW_FONTS)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewFont)
    .withOptions({ clearOnDefault: false }),
};

export const PREVIEW_THEME_QUERY_PARAM_KEYS = Object.keys(
  previewThemeSearchParamParsers,
) as (keyof PreviewThemeConfig)[];

type PreviewThemeSearchParamsState = inferParserType<
  typeof previewThemeSearchParamParsers
>;

function resolveConfigFromParams(
  params: PreviewThemeSearchParamsState,
): PreviewThemeConfig {
  return normalizePreviewThemeConfig({
    previewBaseColor: params.previewBaseColor,
    previewTheme: params.previewTheme,
    previewRadius: params.previewRadius,
    previewDensity: params.previewDensity,
    previewFontScale: params.previewFontScale,
    previewSurfaceTint: params.previewSurfaceTint,
    previewMenuAccent: params.previewMenuAccent,
    previewMenuColor: params.previewMenuColor,
    previewFont: params.previewFont,
  });
}

export function usePreviewThemeSearchParams() {
  const [params, setParams] = useQueryStates(
    previewThemeSearchParamParsers,
    QUERY_STATE_OPTIONS,
  );

  const config = useMemo(() => resolveConfigFromParams(params), [params]);
  const availableThemes = useMemo(
    () => resolveAvailableThemes(config.previewBaseColor),
    [config.previewBaseColor],
  );
  const activePreset = useMemo(() => {
    return PREVIEW_THEME_PRESETS.find((preset) => {
      const keys = Object.keys(preset.config) as (keyof PreviewThemeConfig)[];
      return keys.every((key) => config[key] === preset.config[key]);
    }) ?? null;
  }, [config]);

  const setPreviewTheme = useCallback(
    (updates: Partial<PreviewThemeConfig>) => {
      const nextConfig = normalizePreviewThemeConfig({
        ...config,
        ...updates,
      });

      void setParams(nextConfig, QUERY_STATE_OPTIONS);
    },
    [config, setParams],
  );

  const resetPreviewTheme = useCallback(() => {
    void setParams(DEFAULT_PREVIEW_THEME_CONFIG, QUERY_STATE_OPTIONS);
  }, [setParams]);

  return {
    config,
    availableThemes,
    activePreset,
    setPreviewTheme,
    resetPreviewTheme,
  };
}

export function useResolvedPreviewTheme() {
  const previewTheme = usePreviewThemeSearchParams();
  const { resolvedTheme } = useTheme();
  const resolvedAppearance: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";

  const previewThemeVars = useMemo(
    () => buildPreviewThemeVars(previewTheme.config),
    [previewTheme.config],
  );

  const resolvedPreviewThemeVars =
    resolvedAppearance === "dark" ? previewThemeVars.dark : previewThemeVars.light;

  return {
    ...previewTheme,
    resolvedAppearance,
    resolvedPreviewThemeVars,
  };
}
