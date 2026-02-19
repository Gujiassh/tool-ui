"use client";

import { Palette, RotateCcw } from "lucide-react";
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
  PREVIEW_APPEARANCES,
  PREVIEW_BASE_COLORS,
  PREVIEW_FONTS,
  PREVIEW_MENU_ACCENTS,
  PREVIEW_MENU_COLORS,
  PREVIEW_RADII,
  type PreviewAppearance,
  type PreviewBaseColor,
  type PreviewFont,
  type PreviewMenuAccent,
  type PreviewMenuColor,
  type PreviewRadius,
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
  const { config, availableThemes, setPreviewTheme, resetPreviewTheme } =
    usePreviewThemeSearchParams();

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

        <div className="space-y-2.5">
          <div className="grid grid-cols-[6.5rem_1fr] items-center gap-2">
            <Label htmlFor="preview-appearance" className="text-xs">
              Appearance
            </Label>
            <Select
              value={config.previewAppearance}
              onValueChange={(value) =>
                setPreviewTheme({ previewAppearance: value as PreviewAppearance })
              }
            >
              <SelectTrigger id="preview-appearance" size="sm" className="w-full">
                <SelectValue placeholder="Appearance" />
              </SelectTrigger>
              <SelectContent align="end">
                {PREVIEW_APPEARANCES.map((appearance) => (
                  <SelectItem key={appearance} value={appearance}>
                    {toLabel(appearance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
        </div>
      </PopoverContent>
    </Popover>
  );
}
