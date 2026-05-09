"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { PencilIcon } from "lucide-react";
import { cn } from "@/lib/ui/cn";
import { useDocsToc } from "./docs-toc-context";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useTocKeyboardNav } from "@/hooks/use-toc-keyboard-nav";
import { analytics } from "@/lib/analytics";
import { getDocsEditUrl, getDocsSlug } from "@/lib/site-config";

const HEADER_OFFSET = 80;

export function DocsToc() {
  const pathname = usePathname();
  const { headings, activeId } = useDocsToc();
  const reducedMotion = useReducedMotion();
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const scrollToHeading = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (!element) return;
      const targetScroll =
        element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({
        top: targetScroll,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion],
  );

  const { handleKeyDown, setLinkRef: setKeyboardLinkRef } = useTocKeyboardNav(
    headings,
    scrollToHeading,
  );

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
    title: string,
  ) => {
    e.preventDefault();
    analytics.docs.tocLinkClicked(title, 2);
    scrollToHeading(id);
  };

  useEffect(() => {
    if (typeof window === "undefined" || headings.length === 0) return;
    const hash = window.location.hash.slice(1);
    if (hash && headings.some((h) => h.id === hash)) {
      setTimeout(() => scrollToHeading(hash), 200);
    }
  }, [headings, scrollToHeading]);

  useEffect(() => {
    linkRefs.current = linkRefs.current.slice(0, headings.length);
  }, [headings]);

  const editUrl = useMemo(() => {
    const slug = getDocsSlug(pathname);
    return slug ? getDocsEditUrl(slug) : null;
  }, [pathname]);

  if (headings.length === 0 && !editUrl) {
    return null;
  }

  const setLinkRef = (index: number) => (el: HTMLAnchorElement | null) => {
    linkRefs.current[index] = el;
    setKeyboardLinkRef(index)(el);
  };

  return (
    <nav
      aria-label="Table of contents"
      className="flex flex-col"
      onKeyDown={handleKeyDown}
    >
      {headings.length > 0 && (
        <>
          <p className="mb-3 text-[13px] font-medium text-foreground">
            On this page
          </p>
          <div className="flex flex-col">
            {headings.map((heading, index) => {
              const isActive = heading.id === activeId;
              return (
                <a
                  key={heading.id}
                  ref={setLinkRef(index)}
                  href={`#${heading.id}`}
                  onClick={(e) => handleClick(e, heading.id, heading.text)}
                  className={cn(
                    "block py-1 text-[13px] outline-none transition-colors",
                    "hover:text-foreground focus-visible:text-foreground",
                    isActive
                      ? "font-medium text-brand"
                      : "text-muted-foreground",
                  )}
                  aria-current={isActive ? "true" : undefined}
                  title={heading.text}
                >
                  <span className="line-clamp-2">{heading.text}</span>
                </a>
              );
            })}
          </div>
        </>
      )}

      {editUrl && (
        <div
          className={cn(
            "flex flex-col gap-2",
            headings.length > 0 && "mt-6 border-t border-border/30 pt-4",
          )}
        >
          <a
            href={editUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <PencilIcon className="size-3.5" />
            Edit on GitHub
          </a>
        </div>
      )}
    </nav>
  );
}
