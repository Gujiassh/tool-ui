"use client";

import type { ReactNode } from "react";
import { useMotionReady } from "@/hooks/use-motion-ready";
import { cn } from "@/lib/ui/cn";

interface DocsMotionBoundaryProps {
  children: ReactNode;
  className?: string;
}

/**
 * Docs-only motion gate:
 * suppresses mount-time transitions/animations for previewed components.
 */
export function DocsMotionBoundary({
  children,
  className,
}: DocsMotionBoundaryProps) {
  const isMotionReady = useMotionReady();

  return (
    <div
      data-docs-motion-ready={isMotionReady}
      className={cn("docs-motion-boundary", className)}
    >
      {children}
    </div>
  );
}
