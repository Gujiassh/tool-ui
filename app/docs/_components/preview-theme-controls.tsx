"use client";

import { Check, Copy, Palette, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PREVIEW_BASE_COLORS,
  PREVIEW_FONTS,
  PREVIEW_MENU_ACCENTS,
  PREVIEW_MENU_COLORS,
  PREVIEW_DENSITIES,
  PREVIEW_FONT_SCALES,
  PREVIEW_RADII,
  PREVIEW_SURFACE_TINTS,
  PREVIEW_THEME_PRESETS,
  type PreviewBaseColor,
  type PreviewDensity,
  type PreviewFont,
  type PreviewFontScale,
  type PreviewMenuAccent,
  type PreviewMenuColor,
  type PreviewRadius,
  type PreviewSurfaceTint,
  type PreviewTheme,
} from "@/lib/docs/preview-theme-config";
import { usePreviewThemeSearchParams } from "@/hooks/use-preview-theme-search-params";

function toLabel(value: string): string {
  return value
    .split("-")
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

export function PreviewThemeControls() {
  const { config, availableThemes, activePreset, setPreviewTheme, resetPreviewTheme } =
    usePreviewThemeSearchParams();
  const [copied, setCopied] = useState(false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Palette className="size-3.5" />
          <span className="hidden sm:inline">Preview Theme</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-3">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium">Preview Theme</h3>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(config, null, 2));
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="h-7 gap-1 px-2 text-xs"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetPreviewTheme}
              className="h-7 gap-1 px-2 text-xs"
            >
              <RotateCcw className="size-3" />
              Reset
            </Button>
          </div>
        </div>

        <div className="mb-3">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">Presets</p>
          <div className="flex flex-wrap gap-1">
            {PREVIEW_THEME_PRESETS.map((preset) => (
              <Button
                key={preset.name}
                variant={activePreset?.name === preset.name ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setPreviewTheme(preset.config)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-3 border-t" />

        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Parameters</p>
        <div className="space-y-2.5">
          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2">
            <Label htmlFor="preview-base-color" className="text-xs">
              Base Color
            </Label>
            <Select
              value={config.previewBaseColor}
              onValueChange={(value) =>
                setPreviewTheme({ previewBaseColor: value as PreviewBaseColor })
              }
            >
              <SelectTrigger id="preview-base-color" size="sm" className="w-full">
                <SelectValue placeholder="Base color" />
              </SelectTrigger>
              <SelectContent align="end">
                {PREVIEW_BASE_COLORS.map((baseColor) => (
                  <SelectItem key={baseColor} value={baseColor}>
                    {toLabel(baseColor)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2">
            <Label htmlFor="preview-surface-tint" className="text-xs">
              Surface Tint
            </Label>
            <Select
              value={config.previewSurfaceTint}
              onValueChange={(value) =>
                setPreviewTheme({ previewSurfaceTint: value as PreviewSurfaceTint })
              }
            >
              <SelectTrigger id="preview-surface-tint" size="sm" className="w-full">
                <SelectValue placeholder="Surface tint" />
              </SelectTrigger>
              <SelectContent align="end">
                {PREVIEW_SURFACE_TINTS.map((tint) => (
                  <SelectItem key={tint} value={tint}>
                    {toLabel(tint)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2">
            <Label htmlFor="preview-theme" className="text-xs">
              Theme
            </Label>
            <Select
              value={config.previewTheme}
              onValueChange={(value) =>
                setPreviewTheme({ previewTheme: value as PreviewTheme })
              }
            >
              <SelectTrigger id="preview-theme" size="sm" className="w-full">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent align="end">
                {availableThemes.map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {toLabel(theme)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2">
            <Label htmlFor="preview-radius" className="text-xs">
              Radius
            </Label>
            <Select
              value={config.previewRadius}
              onValueChange={(value) =>
                setPreviewTheme({ previewRadius: value as PreviewRadius })
              }
            >
              <SelectTrigger id="preview-radius" size="sm" className="w-full">
                <SelectValue placeholder="Radius" />
              </SelectTrigger>
              <SelectContent align="end">
                {PREVIEW_RADII.map((radius) => (
                  <SelectItem key={radius} value={radius}>
                    {toLabel(radius)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2">
            <Label htmlFor="preview-density" className="text-xs">
              Density
            </Label>
            <Select
              value={config.previewDensity}
              onValueChange={(value) =>
                setPreviewTheme({ previewDensity: value as PreviewDensity })
              }
            >
              <SelectTrigger id="preview-density" size="sm" className="w-full">
                <SelectValue placeholder="Density" />
              </SelectTrigger>
              <SelectContent align="end">
                {PREVIEW_DENSITIES.map((density) => (
                  <SelectItem key={density} value={density}>
                    {toLabel(density)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2">
            <Label htmlFor="preview-menu-accent" className="text-xs">
              Menu Accent
            </Label>
            <Select
              value={config.previewMenuAccent}
              onValueChange={(value) =>
                setPreviewTheme({ previewMenuAccent: value as PreviewMenuAccent })
              }
            >
              <SelectTrigger id="preview-menu-accent" size="sm" className="w-full">
                <SelectValue placeholder="Menu accent" />
              </SelectTrigger>
              <SelectContent align="end">
                {PREVIEW_MENU_ACCENTS.map((menuAccent) => (
                  <SelectItem key={menuAccent} value={menuAccent}>
                    {toLabel(menuAccent)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2">
            <Label htmlFor="preview-menu-color" className="text-xs">
              Menu Color
            </Label>
            <Select
              value={config.previewMenuColor}
              onValueChange={(value) =>
                setPreviewTheme({ previewMenuColor: value as PreviewMenuColor })
              }
            >
              <SelectTrigger id="preview-menu-color" size="sm" className="w-full">
                <SelectValue placeholder="Menu color" />
              </SelectTrigger>
              <SelectContent align="end">
                {PREVIEW_MENU_COLORS.map((menuColor) => (
                  <SelectItem key={menuColor} value={menuColor}>
                    {toLabel(menuColor)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2">
            <Label htmlFor="preview-font" className="text-xs">
              Font
            </Label>
            <Select
              value={config.previewFont}
              onValueChange={(value) =>
                setPreviewTheme({ previewFont: value as PreviewFont })
              }
            >
              <SelectTrigger id="preview-font" size="sm" className="w-full">
                <SelectValue placeholder="Font" />
              </SelectTrigger>
              <SelectContent align="end">
                {PREVIEW_FONTS.map((font) => (
                  <SelectItem key={font} value={font}>
                    {toLabel(font)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2">
            <Label htmlFor="preview-font-scale" className="text-xs">
              Font Scale
            </Label>
            <Select
              value={config.previewFontScale}
              onValueChange={(value) =>
                setPreviewTheme({ previewFontScale: value as PreviewFontScale })
              }
            >
              <SelectTrigger id="preview-font-scale" size="sm" className="w-full">
                <SelectValue placeholder="Font scale" />
              </SelectTrigger>
              <SelectContent align="end">
                {PREVIEW_FONT_SCALES.map((scale) => (
                  <SelectItem key={scale} value={scale}>
                    {toLabel(scale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
