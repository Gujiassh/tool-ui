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
      const h2ElementsWithId = root.querySelectorAll("h2[id]");
      const extracted = Array.from(h2ElementsWithId).map((el) => ({
        id: el.id,
        text: el.textContent || "",
      }));
      setHeadings(extracted);
    }, 100);

    return () => clearTimeout(timer);
  }, [container, pathname]);

  return headings;
}
