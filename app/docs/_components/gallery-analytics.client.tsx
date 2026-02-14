"use client";

import { useEffect, useRef } from "react";
import { analytics } from "@/lib/analytics";

export function GalleryPageAnalytics() {
  useEffect(() => {
    analytics.gallery.pageViewed();
  }, []);

  return null;
}

interface GalleryPreviewImpressionProps {
  componentId: string;
}

export function GalleryPreviewImpression({
  componentId,
}: GalleryPreviewImpressionProps) {
  const trackedRef = useRef(false);
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (trackedRef.current) {
      return;
    }

    const marker = markerRef.current;
    if (!marker) {
      return;
    }

    if (typeof IntersectionObserver !== "function") {
      trackedRef.current = true;
      analytics.gallery.componentPreviewed(componentId);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || trackedRef.current) continue;

          trackedRef.current = true;
          analytics.gallery.componentPreviewed(componentId);
          observer.disconnect();
          break;
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(marker);

    return () => observer.disconnect();
  }, [componentId]);

  return <span ref={markerRef} className="sr-only" aria-hidden="true" />;
}
