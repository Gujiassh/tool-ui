"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

interface UsePresetParamOptions<T extends string> {
  presets: Record<T, unknown>;
  defaultPreset: T;
  paramName?: string;
}

interface UsePresetParamReturn<T extends string> {
  currentPreset: T;
  setPreset: (preset: T) => void;
}

export function usePresetParam<T extends string>({
  presets,
  defaultPreset,
  paramName = "preset",
}: UsePresetParamOptions<T>): UsePresetParamReturn<T> {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const presetKeys = useMemo(() => new Set(Object.keys(presets)), [presets]);

  const currentPreset = useMemo(() => {
    const paramValue = searchParams.get(paramName);
    if (paramValue !== null && presetKeys.has(paramValue)) {
      return paramValue as T;
    }
    return defaultPreset;
  }, [searchParams, paramName, presetKeys, defaultPreset]);

  const setPreset = useCallback(
    (preset: T) => {
      const currentParamValue = searchParams.get(paramName);
      if (currentParamValue === preset) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set(paramName, preset);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams, paramName],
  );

  return { currentPreset, setPreset };
}
