import { SHADCN_V4_THEMES } from "@/lib/docs/shadcn-v4-themes";

export const PREVIEW_BASE_COLORS = ["neutral", "stone", "zinc", "gray"] as const;
export const PREVIEW_RADII = ["default", "none", "small", "medium", "large"] as const;
export const PREVIEW_DENSITIES = ["compact", "default", "comfortable"] as const;
export const PREVIEW_FONT_SCALES = ["small", "default", "large"] as const;
export const PREVIEW_SURFACE_TINTS = ["none", "warm", "cool", "mauve", "sage", "sand"] as const;
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

export type PreviewBaseColor = (typeof PREVIEW_BASE_COLORS)[number];
export type PreviewRadius = (typeof PREVIEW_RADII)[number];
export type PreviewDensity = (typeof PREVIEW_DENSITIES)[number];
export type PreviewFontScale = (typeof PREVIEW_FONT_SCALES)[number];
export type PreviewSurfaceTint = (typeof PREVIEW_SURFACE_TINTS)[number];
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
  previewBaseColor: PreviewBaseColor;
  previewTheme: PreviewTheme;
  previewRadius: PreviewRadius;
  previewDensity: PreviewDensity;
  previewFontScale: PreviewFontScale;
  previewSurfaceTint: PreviewSurfaceTint;
  previewMenuAccent: PreviewMenuAccent;
  previewMenuColor: PreviewMenuColor;
  previewFont: PreviewFont;
}

export const DEFAULT_PREVIEW_THEME_CONFIG: PreviewThemeConfig = {
  previewBaseColor: "neutral",
  previewTheme: "neutral",
  previewRadius: "default",
  previewDensity: "default",
  previewFontScale: "default",
  previewSurfaceTint: "none",
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

const PREVIEW_DENSITY_SPACING: Record<PreviewDensity, string> = {
  compact: "0.2rem",
  default: "0.25rem",
  comfortable: "0.3rem",
};

const PREVIEW_FONT_SCALE_VALUES: Record<PreviewFontScale, string> = {
  small: "0.875",
  default: "1",
  large: "1.125",
};

const PREVIEW_FONT_FAMILIES: Record<PreviewFont, string> = {
  geist: "var(--font-geist-sans), sans-serif",
  inter: "var(--font-inter), var(--font-geist-sans), sans-serif",
  "noto-sans": "var(--font-noto-sans), var(--font-geist-sans), sans-serif",
  "nunito-sans": "var(--font-nunito-sans), var(--font-geist-sans), sans-serif",
  figtree: "var(--font-figtree), var(--font-geist-sans), sans-serif",
  roboto: "var(--font-roboto), var(--font-geist-sans), sans-serif",
  raleway: "var(--font-raleway), var(--font-geist-sans), sans-serif",
  "dm-sans": "var(--font-dm-sans), var(--font-geist-sans), sans-serif",
  "public-sans": "var(--font-public-sans), var(--font-geist-sans), sans-serif",
  outfit: "var(--font-outfit), var(--font-geist-sans), sans-serif",
  "jetbrains-mono": "var(--font-jetbrains-mono), var(--font-geist-mono), monospace",
  "geist-mono": "var(--font-geist-mono), monospace",
};

const SURFACE_TINT_MAP: Record<
  Exclude<PreviewSurfaceTint, "none">,
  { hue: number; chroma: number }
> = {
  warm: { hue: 60, chroma: 0.015 },
  cool: { hue: 240, chroma: 0.012 },
  mauve: { hue: 300, chroma: 0.015 },
  sage: { hue: 150, chroma: 0.012 },
  sand: { hue: 80, chroma: 0.015 },
};

const SURFACE_TINT_TOKENS = new Set([
  "background",
  "foreground",
  "card",
  "card-foreground",
  "muted",
  "muted-foreground",
  "border",
  "input",
  "popover",
  "popover-foreground",
  "secondary",
  "secondary-foreground",
  "accent",
  "accent-foreground",
  "sidebar-background",
  "sidebar-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
]);

const OKLCH_RE = /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/;
const FOREGROUND_TOKEN_RE = /-foreground$|^foreground$/;

function applySurfaceTint(vars: RawThemeVars, tint: Exclude<PreviewSurfaceTint, "none">): void {
  const { hue, chroma } = SURFACE_TINT_MAP[tint];

  for (const token of SURFACE_TINT_TOKENS) {
    const value = vars[token];
    if (!value) continue;

    const match = OKLCH_RE.exec(value);
    if (!match) continue;

    const currentChroma = parseFloat(match[2]!);
    if (currentChroma >= 0.01) continue;

    const l = match[1]!;
    const isForeground = FOREGROUND_TOKEN_RE.test(token);
    const targetChroma = isForeground ? 0.005 : chroma;

    vars[token] = `oklch(${l} ${targetChroma} ${hue})`;
  }
}

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

  if (resolvedConfig.previewDensity !== "default") {
    const spacing = PREVIEW_DENSITY_SPACING[resolvedConfig.previewDensity];
    lightVars.spacing = spacing;
    darkVars.spacing = spacing;
  }

  if (resolvedConfig.previewSurfaceTint !== "none") {
    applySurfaceTint(lightVars, resolvedConfig.previewSurfaceTint);
    applySurfaceTint(darkVars, resolvedConfig.previewSurfaceTint);
  }

  const fontFamily = PREVIEW_FONT_FAMILIES[resolvedConfig.previewFont];
  lightVars["font-sans"] = fontFamily;
  darkVars["font-sans"] = fontFamily;

  const zoom = PREVIEW_FONT_SCALE_VALUES[resolvedConfig.previewFontScale];
  lightVars["zoom"] = zoom;
  darkVars["zoom"] = zoom;

  return {
    light: toCssVarMap(lightVars),
    dark: toCssVarMap(darkVars),
  };
}

