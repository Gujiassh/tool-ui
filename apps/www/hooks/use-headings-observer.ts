"use client";

import { useEffect, useState } from "react";
import type { Heading } from "./use-extract-headings";

export function useHeadingsObserver(
  headings: Heading[],
  _container: HTMLElement | null = null,
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0 || typeof window === "undefined") return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const visibleHeadings = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleHeadings.add(entry.target.id);
          } else {
            visibleHeadings.delete(entry.target.id);
          }
        }

        if (visibleHeadings.size > 0) {
          const firstVisible = headings.find((h) => visibleHeadings.has(h.id));
          if (firstVisible) setActiveId(firstVisible.id);
          return;
        }

        const scrollY = window.scrollY + 100;
        let closest: Heading | null = null;
        for (const heading of headings) {
          const el = document.getElementById(heading.id);
          if (
            el &&
            el.getBoundingClientRect().top + window.scrollY <= scrollY
          ) {
            closest = heading;
          } else {
            break;
          }
        }
        if (closest) setActiveId(closest.id);
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}
