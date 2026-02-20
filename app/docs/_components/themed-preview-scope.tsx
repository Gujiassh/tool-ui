"use client";

import { type CSSProperties, type ReactNode } from "react";
import { useResolvedPreviewTheme } from "@/hooks/use-preview-theme-search-params";
import { cn } from "@/lib/ui/cn";

interface ThemedPreviewScopeProps {
  children: ReactNode;
  className?: string;
}

export function ThemedPreviewScope({
  children,
  className,
}: ThemedPreviewScopeProps) {
  const { resolvedAppearance, resolvedPreviewThemeVars } =
    useResolvedPreviewTheme();
  const { "--zoom": zoomValue, ...themeVars } = resolvedPreviewThemeVars;
  const style = {
    ...themeVars,
    fontFamily: "var(--font-sans)",
    zoom: zoomValue,
  } as CSSProperties;

  return (
    <div suppressHydrationWarning data-theme={resolvedAppearance} style={style} className={cn("flex w-full justify-center", className)}>
      {children}
    </div>
  );
}
