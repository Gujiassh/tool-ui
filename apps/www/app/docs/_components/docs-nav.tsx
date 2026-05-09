"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryState } from "nuqs";
import { LayoutDashboardIcon } from "lucide-react";
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
    <nav className="flex flex-col px-5 py-5">
      <Link
        href="/docs/gallery"
        className={cn(
          "flex items-center gap-2 py-1.5 text-[13.5px] transition-colors",
          pathname === "/docs/gallery"
            ? "font-medium text-brand"
            : "text-foreground/85 hover:text-foreground",
        )}
        onClick={() =>
          analytics.docs.navigationClicked("Gallery", "/docs/gallery")
        }
      >
        <LayoutDashboardIcon className="size-3.5 shrink-0" />
        Gallery
      </Link>

      {sections.map((section) => (
        <SidebarSection
          key={section.id}
          section={section}
          pathname={pathname}
        />
      ))}
    </nav>
  );
}

function SidebarSection({
  section,
  pathname,
}: {
  section: Section;
  pathname: string;
}) {
  return (
    <div className="mt-6">
      <p className="mb-1 py-1 text-[13.5px] font-medium text-foreground">
        {section.label}
      </p>
      <div className="flex flex-col">
        {section.items.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "relative block py-1.5 text-[13.5px] transition-colors",
                isActive
                  ? "font-medium text-brand"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() =>
                analytics.docs.navigationClicked(item.label, item.href)
              }
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 -left-3.5 size-1 -translate-y-1/2 rounded-full bg-brand"
                />
              )}
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
