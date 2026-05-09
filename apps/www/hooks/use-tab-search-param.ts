"use client";

import { useQueryState } from "nuqs";
import { type RefObject, useCallback, useEffect, useRef } from "react";

interface UseTabSearchParamOptions<T extends string> {
  paramName?: string;
  defaultTab: T;
  validTabs: readonly T[];
  scrollTargetRef?: RefObject<HTMLElement | null>;
  hashTrigger?: string;
}

interface UseTabSearchParamReturn<T extends string> {
  activeTab: T;
  setActiveTab: (tab: T) => void;
}

export function resolveTabFromSearchParam<T extends string>(
  rawTab: string | null,
  defaultTab: T,
  validTabs: readonly T[],
): T {
  return rawTab !== null && validTabs.includes(rawTab as T)
    ? (rawTab as T)
    : defaultTab;
}

export function useTabSearchParam<T extends string>({
  paramName = "tab",
  defaultTab,
  validTabs,
  scrollTargetRef,
  hashTrigger,
}: UseTabSearchParamOptions<T>): UseTabSearchParamReturn<T> {
  const isInitialMount = useRef(true);

  const [rawTab, setRawTab] = useQueryState(paramName);
  const activeTab = resolveTabFromSearchParam(rawTab, defaultTab, validTabs);

  // Handle hash trigger (e.g., #examples in URL)
  useEffect(() => {
    if (!hashTrigger || typeof window === "undefined") return;

    const hash = window.location.hash;
    if (hash === hashTrigger) {
      const hashTab = hashTrigger.replace("#", "") as T;
      if (validTabs.includes(hashTab) && rawTab !== hashTab) {
        setRawTab(hashTab);
      }
    }
  }, [hashTrigger, rawTab, setRawTab, validTabs]);

  // Handle scroll to target when switching to hash-triggered tab
  useEffect(() => {
    if (
      scrollTargetRef?.current &&
      hashTrigger &&
      activeTab === hashTrigger.replace("#", "") &&
      !isInitialMount.current
    ) {
      scrollTargetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    isInitialMount.current = false;
  }, [activeTab, hashTrigger, scrollTargetRef]);

  const setActiveTab = useCallback(
    (newTab: T) => {
      if (newTab === activeTab) return;
      setRawTab(newTab);
    },
    [activeTab, setRawTab],
  );

  return { activeTab, setActiveTab };
}
