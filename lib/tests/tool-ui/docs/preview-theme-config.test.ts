import { describe, expect, it } from "vitest";
import {
  buildPreviewThemeVars,
  DEFAULT_PREVIEW_THEME_CONFIG,
  normalizePreviewThemeConfig,
  resolveAvailableThemes,
  resolvePreviewAppearance,
} from "@/lib/docs/preview-theme-config";

describe("preview theme config", () => {
  it("filters available themes by base color compatibility", () => {
    const neutralThemes = resolveAvailableThemes("neutral");

    expect(neutralThemes).toContain("neutral");
    expect(neutralThemes).toContain("lime");
    expect(neutralThemes).not.toContain("stone");
  });

  it("normalizes incompatible baseColor/theme combinations", () => {
    const normalized = normalizePreviewThemeConfig({
      ...DEFAULT_PREVIEW_THEME_CONFIG,
      previewBaseColor: "stone",
      previewTheme: "neutral",
    });

    expect(normalized.previewTheme).toBe("stone");
  });

  it("applies menu accent bold transform", () => {
    const vars = buildPreviewThemeVars({
      ...DEFAULT_PREVIEW_THEME_CONFIG,
      previewTheme: "lime",
      previewMenuAccent: "bold",
    });

    expect(vars.light["--accent"]).toBe(vars.light["--primary"]);
    expect(vars.dark["--accent-foreground"]).toBe(
      vars.dark["--primary-foreground"],
    );
    expect(vars.light["--sidebar-accent"]).toBe(vars.light["--primary"]);
  });

  it("applies radius transform when radius is customized", () => {
    const vars = buildPreviewThemeVars({
      ...DEFAULT_PREVIEW_THEME_CONFIG,
      previewRadius: "large",
    });

    expect(vars.light["--radius"]).toBe("0.875rem");
    expect(vars.dark["--radius"]).toBe("0.875rem");
  });

  it("resolves system appearance using site theme", () => {
    expect(resolvePreviewAppearance("system", "dark")).toBe("dark");
    expect(resolvePreviewAppearance("system", "light")).toBe("light");
  });
});
