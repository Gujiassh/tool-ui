"use client";

import { useEffect, useState } from "react";
import type { GeoMapProps } from "./schema";

export type ResolvedTheme = "light" | "dark";

function resolveDataTheme(root: HTMLElement): ResolvedTheme | null {
  const dataTheme = root.getAttribute("data-theme");
  if (dataTheme === "dark") return "dark";
  if (dataTheme === "light") return "light";

  if (root.classList.contains("dark")) return "dark";
  if (root.classList.contains("light")) return "light";

  return null;
}

export function useResolvedTheme(theme: GeoMapProps["theme"]): ResolvedTheme {
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    theme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    if (theme === "light" || theme === "dark") {
      setResolvedTheme(theme);
      return;
    }

    if (typeof window === "undefined") {
      setResolvedTheme("light");
      return;
    }

    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const resolve = () => {
      const explicitTheme = resolveDataTheme(root);
      if (explicitTheme) {
        setResolvedTheme(explicitTheme);
        return;
      }

      setResolvedTheme(mediaQuery.matches ? "dark" : "light");
    };

    resolve();

    const mutationObserver = new MutationObserver(resolve);
    mutationObserver.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", resolve);
      return () => {
        mutationObserver.disconnect();
        mediaQuery.removeEventListener("change", resolve);
      };
    }

    mediaQuery.addListener(resolve);
    return () => {
      mutationObserver.disconnect();
      mediaQuery.removeListener(resolve);
    };
  }, [theme]);

  return resolvedTheme;
}
