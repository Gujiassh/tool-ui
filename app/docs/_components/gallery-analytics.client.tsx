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

  useEffect(() => {
    if (trackedRef.current) {
      return;
    }

    trackedRef.current = true;
    analytics.gallery.componentPreviewed(componentId);
  }, [componentId]);

  return null;
}
