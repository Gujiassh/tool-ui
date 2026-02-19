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
  PREVIEW_APPEARANCES,
  PREVIEW_BASE_COLORS,
  PREVIEW_FONTS,
  PREVIEW_MENU_ACCENTS,
  PREVIEW_MENU_COLORS,
  PREVIEW_RADII,
  PREVIEW_THEMES,
  resolveAvailableThemes,
  resolvePreviewAppearance,
  type PreviewThemeConfig,
} from "@/lib/docs/preview-theme-config";

const QUERY_STATE_OPTIONS = {
  history: "replace" as const,
  shallow: true,
  scroll: false,
};

const previewThemeSearchParamParsers = {
  previewAppearance: parseAsStringLiteral(PREVIEW_APPEARANCES)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewAppearance)
    .withOptions({ clearOnDefault: false }),
  previewBaseColor: parseAsStringLiteral(PREVIEW_BASE_COLORS)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewBaseColor)
    .withOptions({ clearOnDefault: false }),
  previewTheme: parseAsStringLiteral(PREVIEW_THEMES)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewTheme)
    .withOptions({ clearOnDefault: false }),
  previewRadius: parseAsStringLiteral(PREVIEW_RADII)
    .withDefault(DEFAULT_PREVIEW_THEME_CONFIG.previewRadius)
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
    previewAppearance: params.previewAppearance,
    previewBaseColor: params.previewBaseColor,
    previewTheme: params.previewTheme,
    previewRadius: params.previewRadius,
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
    setPreviewTheme,
    resetPreviewTheme,
  };
}

export function useResolvedPreviewTheme() {
  const previewTheme = usePreviewThemeSearchParams();
  const { resolvedTheme } = useTheme();
  const resolvedSiteTheme = resolvedTheme === "dark" ? "dark" : "light";

  const resolvedAppearance = useMemo(
    () =>
      resolvePreviewAppearance(
        previewTheme.config.previewAppearance,
        resolvedSiteTheme,
      ),
    [previewTheme.config.previewAppearance, resolvedSiteTheme],
  );

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
