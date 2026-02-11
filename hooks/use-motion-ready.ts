"use client";

import { useEffect, useState } from "react";

/**
 * Returns false on first paint, then true on the next animation frame.
 * Use this to suppress mount-time enter animations while preserving
 * subsequent state-change animations.
 */
export function useMotionReady(): boolean {
  const [isMotionReady, setIsMotionReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const rafId = window.requestAnimationFrame(() => {
      setIsMotionReady(true);
    });

    return () => window.cancelAnimationFrame(rafId);
  }, []);

  return isMotionReady;
}
