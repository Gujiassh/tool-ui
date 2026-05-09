"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type Heading = {
  id: string;
  text: string;
};

export function useExtractHeadings(
  container: HTMLElement | null = null,
): Heading[] {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const root: Document | HTMLElement | null =
      container ?? (typeof document !== "undefined" ? document : null);
    if (!root) return;

    const timer = setTimeout(() => {
      const h2ElementsWithId = root.querySelectorAll(".prose h2[id]");
      const seen = new Set<string>();
      const extracted: Heading[] = [];
      for (const el of Array.from(h2ElementsWithId)) {
        if (seen.has(el.id)) continue;
        seen.add(el.id);
        extracted.push({ id: el.id, text: el.textContent || "" });
      }
      setHeadings(extracted);
    }, 100);

    return () => clearTimeout(timer);
  }, [container, pathname]);

  return headings;
}
