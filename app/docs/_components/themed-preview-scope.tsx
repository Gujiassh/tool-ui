"use client";

import { type CSSProperties, type ReactNode, useState, useEffect } from "react";
import { useResolvedPreviewTheme } from "@/hooks/use-preview-theme-search-params";
import { cn } from "@/lib/ui/cn";

interface ThemedPreviewScopeStaticProps {
  children: ReactNode;
  className?: string;
  resolvedAppearance: "light" | "dark";
  resolvedPreviewThemeVars: Record<string, string>;
  noZoom?: boolean;
}

export function ThemedPreviewScopeStatic({
  children,
  className,
  resolvedAppearance,
  resolvedPreviewThemeVars,
  noZoom,
}: ThemedPreviewScopeStaticProps) {
  const { "--zoom": zoomValue, ...themeVars } = resolvedPreviewThemeVars;
  const style = {
    ...themeVars,
    fontFamily: "var(--font-sans)",
    ...(noZoom ? {} : { zoom: zoomValue }),
  } as CSSProperties;

  return (
    <div data-theme={resolvedAppearance} style={style} className={cn("flex w-full justify-center", className)}>
      {children}
    </div>
  );
}

interface ThemedPreviewScopeProps {
  children: ReactNode;
  className?: string;
  noZoom?: boolean;
}

export function ThemedPreviewScope({
  children,
  className,
  noZoom,
}: ThemedPreviewScopeProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { resolvedAppearance, resolvedPreviewThemeVars } =
    useResolvedPreviewTheme();
  const { "--zoom": zoomValue, ...themeVars } = resolvedPreviewThemeVars;
  const style = {
    ...themeVars,
    fontFamily: "var(--font-sans)",
    ...(noZoom ? {} : { zoom: zoomValue }),
  } as CSSProperties;

  return (
    <div
      data-theme={mounted ? resolvedAppearance : undefined}
      style={mounted ? style : undefined}
      className={cn("flex w-full justify-center", className)}
    >
      {children}
    </div>
  );
}
