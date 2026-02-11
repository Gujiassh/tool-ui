"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/ui/cn";
import { useDocsToc } from "./docs-toc-context";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useTocKeyboardNav } from "@/hooks/use-toc-keyboard-nav";
import { resolveTocIndicatorState } from "./toc-indicator-state";

export function DocsToc() {
  const { scrollContainer, headings, activeId } = useDocsToc();
  const reducedMotion = useReducedMotion();
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hasPositionedIndicator = useRef(false);
  const [indicatorState, setIndicatorState] = useState({
    top: null as number | null,
    transition: "none",
  });

  const scrollToHeading = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      const container = scrollContainer;
      if (!element || !container) return;

      const stickyHeader = container.querySelector('[role="tablist"]');
      const offset = stickyHeader
        ? stickyHeader.getBoundingClientRect().height + 20
        : 80;

      const targetScroll = element.offsetTop - offset;

      if (reducedMotion) {
        container.scrollTop = targetScroll;
      } else {
        container.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    },
    [scrollContainer, reducedMotion],
  );

  const { handleKeyDown, setLinkRef: setKeyboardLinkRef } = useTocKeyboardNav(
    headings,
    scrollToHeading,
  );

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
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

  // Update indicator position when activeId changes
  useEffect(() => {
    let measuredTop: number | null = null;
    const activeIndex = headings.findIndex((h) => h.id === activeId);
    if (activeIndex >= 0 && linkRefs.current[activeIndex]) {
      const activeLink = linkRefs.current[activeIndex];
      if (activeLink) {
        const linkRect = activeLink.getBoundingClientRect();
        const navRect = activeLink.parentElement?.getBoundingClientRect();
        if (navRect) {
          measuredTop = linkRect.top - navRect.top + 8;
        }
      }
    }

    setIndicatorState(
      resolveTocIndicatorState({
        reducedMotion,
        measuredTop,
        hasPositioned: hasPositionedIndicator.current,
      }),
    );

    if (measuredTop !== null) {
      hasPositionedIndicator.current = true;
    }
  }, [activeId, headings, reducedMotion]);

  if (headings.length === 0) {
    return null;
  }

  const activeIndex = headings.findIndex((h) => h.id === activeId);

  const setLinkRef = (index: number) => (el: HTMLAnchorElement | null) => {
    linkRefs.current[index] = el;
    setKeyboardLinkRef(index)(el);
  };

  return (
    <nav
      aria-label="Table of contents"
      className="relative space-y-1"
      onKeyDown={handleKeyDown}
    >
      <p className="text-primary/60 mb-4 cursor-default text-xs tracking-widest uppercase select-none">
        On This Page
      </p>
      {activeIndex >= 0 && indicatorState.top !== null && (
        <span
          aria-hidden="true"
          className="bg-foreground pointer-events-none absolute -left-3 h-3 w-0.5 rounded-full"
          style={{
            top: indicatorState.top,
            opacity: 1,
            transition: indicatorState.transition,
          }}
        />
      )}
      {headings.map((heading, index) => {
        const isActive = heading.id === activeId;
        return (
          <a
            key={heading.id}
            ref={setLinkRef(index)}
            href={`#${heading.id}`}
            onClick={(e) => handleClick(e, heading.id)}
            className={cn(
              "relative block py-1 text-sm transition-colors",
              "hover:text-foreground focus-visible:outline-none focus-visible:text-foreground",
              isActive && "text-foreground font-medium",
              !isActive && "text-muted-foreground",
            )}
            aria-current={isActive ? "true" : undefined}
            title={heading.text}
          >
            <span className="line-clamp-2">{heading.text}</span>
          </a>
        );
      })}
    </nav>
  );
}
