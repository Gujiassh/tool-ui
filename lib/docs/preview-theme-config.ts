import { SHADCN_V4_THEMES } from "@/lib/docs/shadcn-v4-themes";

export const PREVIEW_APPEARANCES = ["system", "light", "dark"] as const;
export const PREVIEW_BASE_COLORS = ["neutral", "stone", "zinc", "gray"] as const;
export const PREVIEW_RADII = ["default", "none", "small", "medium", "large"] as const;
export const PREVIEW_MENU_ACCENTS = ["subtle", "bold"] as const;
export const PREVIEW_MENU_COLORS = ["default", "inverted"] as const;
export const PREVIEW_FONTS = [
  "geist",
  "inter",
  "noto-sans",
  "nunito-sans",
  "figtree",
  "roboto",
  "raleway",
  "dm-sans",
  "public-sans",
  "outfit",
  "jetbrains-mono",
  "geist-mono",
] as const;

export type PreviewAppearance = (typeof PREVIEW_APPEARANCES)[number];
export type PreviewBaseColor = (typeof PREVIEW_BASE_COLORS)[number];
export type PreviewRadius = (typeof PREVIEW_RADII)[number];
export type PreviewMenuAccent = (typeof PREVIEW_MENU_ACCENTS)[number];
export type PreviewMenuColor = (typeof PREVIEW_MENU_COLORS)[number];
export type PreviewFont = (typeof PREVIEW_FONTS)[number];

const ALL_THEME_NAMES = SHADCN_V4_THEMES.map((theme) => theme.name) as [
  (typeof SHADCN_V4_THEMES)[number]["name"],
  ...(typeof SHADCN_V4_THEMES)[number]["name"][],
];

export const PREVIEW_THEMES = ALL_THEME_NAMES;
export type PreviewTheme = (typeof PREVIEW_THEMES)[number];

export interface PreviewThemeConfig {
  previewAppearance: PreviewAppearance;
  previewBaseColor: PreviewBaseColor;
  previewTheme: PreviewTheme;
  previewRadius: PreviewRadius;
  previewMenuAccent: PreviewMenuAccent;
  previewMenuColor: PreviewMenuColor;
  previewFont: PreviewFont;
}

export const DEFAULT_PREVIEW_THEME_CONFIG: PreviewThemeConfig = {
  previewAppearance: "system",
  previewBaseColor: "neutral",
  previewTheme: "neutral",
  previewRadius: "default",
  previewMenuAccent: "subtle",
  previewMenuColor: "default",
  previewFont: "geist",
};

const PREVIEW_RADIUS_VALUES: Record<PreviewRadius, string> = {
  default: "0.625rem",
  none: "0",
  small: "0.45rem",
  medium: "0.625rem",
  large: "0.875rem",
};

const PREVIEW_FONT_FAMILIES: Record<PreviewFont, string> = {
  geist: "var(--font-geist-sans), 'Geist Variable', sans-serif",
  inter: "'Inter Variable', var(--font-geist-sans), sans-serif",
  "noto-sans": "'Noto Sans Variable', var(--font-geist-sans), sans-serif",
  "nunito-sans": "'Nunito Sans Variable', var(--font-geist-sans), sans-serif",
  figtree: "'Figtree Variable', var(--font-geist-sans), sans-serif",
  roboto: "'Roboto', var(--font-geist-sans), sans-serif",
  raleway: "'Raleway', var(--font-geist-sans), sans-serif",
  "dm-sans": "'DM Sans', var(--font-geist-sans), sans-serif",
  "public-sans": "'Public Sans', var(--font-geist-sans), sans-serif",
  outfit: "'Outfit', var(--font-geist-sans), sans-serif",
  "jetbrains-mono": "'JetBrains Mono Variable', var(--font-geist-mono), monospace",
  "geist-mono": "var(--font-geist-mono), 'Geist Mono Variable', monospace",
};

const BASE_COLOR_SET = new Set<string>(PREVIEW_BASE_COLORS);

const SHADCN_THEME_BY_NAME = new Map(
  SHADCN_V4_THEMES.map((theme) => [theme.name, theme]),
);

const SIDEBAR_TOKEN_KEYS = [
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const;

type RawThemeVars = Record<string, string>;
export type PreviewThemeVarMap = Record<`--${string}`, string>;

function toCssVarMap(vars: RawThemeVars): PreviewThemeVarMap {
  const cssVars: Record<`--${string}`, string> = {};

  for (const [name, value] of Object.entries(vars)) {
    cssVars[`--${name}`] = value;
  }

  return cssVars;
}

function getThemeVars(themeName: PreviewTheme): {
  light: RawThemeVars;
  dark: RawThemeVars;
} {
  const theme = SHADCN_THEME_BY_NAME.get(themeName);
  if (!theme) {
    throw new Error(`Theme \"${themeName}\" not found in shadcn v4 theme list.`);
  }

  return {
    light: { ...theme.cssVars.light },
    dark: { ...theme.cssVars.dark },
  };
}

export function resolveAvailableThemes(baseColor: PreviewBaseColor): PreviewTheme[] {
  return PREVIEW_THEMES.filter((themeName) => {
    if (themeName === baseColor) return true;
    return !BASE_COLOR_SET.has(themeName);
  });
}

export function normalizePreviewThemeConfig(
  config: PreviewThemeConfig,
): PreviewThemeConfig {
  const availableThemes = resolveAvailableThemes(config.previewBaseColor);

  if (availableThemes.includes(config.previewTheme)) {
    return config;
  }

  return {
    ...config,
    previewTheme: config.previewBaseColor,
  };
}

export function buildPreviewThemeVars(config: PreviewThemeConfig): {
  light: PreviewThemeVarMap;
  dark: PreviewThemeVarMap;
} {
  const resolvedConfig = normalizePreviewThemeConfig(config);
  const baseColorVars = getThemeVars(resolvedConfig.previewBaseColor);
  const themeVars = getThemeVars(resolvedConfig.previewTheme);

  const lightVars: RawThemeVars = {
    ...baseColorVars.light,
    ...themeVars.light,
  };

  const darkVars: RawThemeVars = {
    ...baseColorVars.dark,
    ...themeVars.dark,
  };

  if (resolvedConfig.previewMenuAccent === "bold") {
    lightVars.accent = lightVars.primary;
    lightVars["accent-foreground"] = lightVars["primary-foreground"];
    darkVars.accent = darkVars.primary;
    darkVars["accent-foreground"] = darkVars["primary-foreground"];

    lightVars["sidebar-accent"] = lightVars.primary;
    lightVars["sidebar-accent-foreground"] = lightVars["primary-foreground"];
    darkVars["sidebar-accent"] = darkVars.primary;
    darkVars["sidebar-accent-foreground"] = darkVars["primary-foreground"];
  }

  if (resolvedConfig.previewMenuColor === "inverted") {
    const lightSidebarVars = Object.fromEntries(
      SIDEBAR_TOKEN_KEYS
        .map((key) => [key, lightVars[key]])
        .filter(([, value]) => typeof value === "string"),
    ) as RawThemeVars;

    const darkSidebarVars = Object.fromEntries(
      SIDEBAR_TOKEN_KEYS
        .map((key) => [key, darkVars[key]])
        .filter(([, value]) => typeof value === "string"),
    ) as RawThemeVars;

    Object.assign(lightVars, darkSidebarVars);
    Object.assign(darkVars, lightSidebarVars);
  }

  if (resolvedConfig.previewRadius !== "default") {
    const radius = PREVIEW_RADIUS_VALUES[resolvedConfig.previewRadius];
    lightVars.radius = radius;
    darkVars.radius = radius;
  }

  const fontFamily = PREVIEW_FONT_FAMILIES[resolvedConfig.previewFont];
  lightVars["font-sans"] = fontFamily;
  darkVars["font-sans"] = fontFamily;

  return {
    light: toCssVarMap(lightVars),
    dark: toCssVarMap(darkVars),
  };
}

export function resolvePreviewAppearance(
  appearance: PreviewAppearance,
  resolvedSiteTheme: "light" | "dark" | null | undefined,
): "light" | "dark" {
  if (appearance === "light" || appearance === "dark") {
    return appearance;
  }

  return resolvedSiteTheme === "dark" ? "dark" : "light";
}
