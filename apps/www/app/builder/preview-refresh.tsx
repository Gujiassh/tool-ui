"use client";

import { createContext, type FC, useContext, useEffect } from "react";

export const PreviewRefreshContext = createContext<(() => void) | null>(null);

export function usePreviewRefresh() {
  return useContext(PreviewRefreshContext);
}

let globalRefresh: (() => void) | null = null;

export function triggerPreviewRefresh() {
  globalRefresh?.();
}

export const PreviewRefreshSetter: FC = () => {
  const refresh = usePreviewRefresh();
  useEffect(() => {
    globalRefresh = refresh;
    return () => {
      globalRefresh = null;
    };
  }, [refresh]);
  return null;
};
