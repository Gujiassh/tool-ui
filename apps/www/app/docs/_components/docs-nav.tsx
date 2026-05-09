"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDownIcon, LayoutDashboardIcon } from "lucide-react";
import { analytics } from "@/lib/analytics";
import {
  componentsRegistry,
  componentsByCategory,
  CATEGORY_META,
  type ComponentCategory,
} from "@/lib/docs/component-registry";
import { cn } from "@/lib/ui/cn";
import { CONCEPTS_DOCS_PAGES, GET_STARTED_DOCS_PAGES } from "./docs-pages";

type SidebarItem = {
  key: string;
  path: string;
  label: string;
  href: string;
};

type Section = {
  id: string;
  label: string;
  items: SidebarItem[];
  defaultOpen?: boolean;
};

const ACCORDION_TRANSITION = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1] as const,
};

export function DocsNav() {
  const pathname = usePathname();
  const [currentTab] = useQueryState("tab");
  const [currentView] = useQueryState("view");
  const previousPathRef = React.useRef<string | null>(null);

  useEffect(() => {
    const component = componentsRegistry.find(
      (entry) => entry.path === pathname,
    );
    if (component) {
      const source =
        previousPathRef.current === "/docs/gallery" ? "gallery" : "direct";
      analytics.component.viewed(component.id, source);
    }
    previousPathRef.current = pathname;
  }, [pathname]);

  const sections = useMemo<Section[]>(() => {
    const buildComponentHref = (path: string) => {
      if (currentTab !== "examples") return path;
      const params = new URLSearchParams();
      params.set("tab", "examples");
      if (currentView === "chat" || currentView === "code") {
        params.set("view", currentView);
      }
      return `${path}?${params.toString()}`;
    };

    const componentSections: Section[] = (
      Object.entries(CATEGORY_META) as [
        ComponentCategory,
        (typeof CATEGORY_META)[ComponentCategory],
      ][]
    )
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([category, meta]) => ({
        id: `category-${category}`,
        label: meta.label,
        items: (componentsByCategory.get(category) || []).map((c) => ({
          key: c.id,
          path: c.path,
          label: c.label,
          href: buildComponentHref(c.path),
        })),
      }));

    return [
      {
        id: "get-started",
        label: "Get Started",
        defaultOpen: true,
        items: GET_STARTED_DOCS_PAGES.map((p) => ({
          key: p.path,
          path: p.path,
          label: p.label,
          href: p.path,
        })),
      },
      {
        id: "concepts",
        label: "Concepts",
        items: CONCEPTS_DOCS_PAGES.map((p) => ({
          key: p.path,
          path: p.path,
          label: p.label,
          href: p.path,
        })),
      },
      ...componentSections,
    ];
  }, [currentTab, currentView]);

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-4">
      <Link
        href="/docs/gallery"
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors",
          pathname === "/docs/gallery"
            ? "bg-accent/40 font-medium text-foreground"
            : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
        )}
        onClick={() =>
          analytics.docs.navigationClicked("Gallery", "/docs/gallery")
        }
      >
        <LayoutDashboardIcon className="size-3.5 shrink-0" />
        Gallery
      </Link>

      <div className="my-3 border-t border-border/40" />

      {sections.map((section) => {
        const containsActive = section.items.some((i) => i.path === pathname);
        return (
          <SidebarSection
            key={section.id}
            section={section}
            pathname={pathname}
            initialOpen={section.defaultOpen ?? containsActive}
            containsActive={containsActive}
          />
        );
      })}
    </nav>
  );
}

type SidebarSectionProps = {
  section: Section;
  pathname: string;
  initialOpen: boolean;
  containsActive: boolean;
};

function SidebarSection({
  section,
  pathname,
  initialOpen,
  containsActive,
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  useEffect(() => {
    if (containsActive) setIsOpen(true);
  }, [containsActive]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] font-medium",
          "text-foreground/80 transition-colors hover:bg-accent/30 hover:text-foreground",
        )}
        aria-expanded={isOpen}
      >
        <span>{section.label}</span>
        <motion.span
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.18 }}
          className="text-muted-foreground"
        >
          <ChevronDownIcon className="size-3.5" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={ACCORDION_TRANSITION}
            className="overflow-hidden"
          >
            <div className="mt-0.5 mb-1 ml-3 border-l border-border/40 pl-1.5">
              {section.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "block rounded-md px-2 py-1.5 text-[13px] transition-colors",
                      isActive
                        ? "bg-accent/40 font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
                    )}
                    onClick={() =>
                      analytics.docs.navigationClicked(item.label, item.href)
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
