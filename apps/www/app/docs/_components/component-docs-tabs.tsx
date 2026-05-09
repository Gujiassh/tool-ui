"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { memo, type ReactNode, useCallback, useMemo, useRef } from "react";
import { useTabSearchParam } from "@/hooks/use-tab-search-param";
import { analytics } from "@/lib/analytics";
import type { ComponentId } from "@/lib/docs/component-ids";
import { componentsRegistry } from "@/lib/docs/component-registry";
import { cn } from "@/lib/ui/cn";
import { DocsContent } from "./docs-content";

type DocsTab = "docs" | "examples";

const VALID_TABS = ["docs", "examples"] as const;

interface ComponentDocsTabsProps {
  docs: ReactNode;
  componentId?: ComponentId;
  examples?: ReactNode;
}

const LazyComponentPreview = dynamic(
  () => import("./component-preview").then((m) => m.ComponentPreview),
  {
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
        Loading examples...
      </div>
    ),
  },
);

const tabTriggerClass = cn(
  "relative inline-flex items-center px-3 py-2.5 font-medium text-[13px] outline-none transition-colors",
  "text-muted-foreground hover:text-foreground",
  "data-[state=active]:text-foreground",
  "after:absolute after:inset-x-0 after:-bottom-px after:h-[2px]",
  "after:bg-transparent data-[state=active]:after:bg-foreground",
);

export const ComponentDocsTabs = memo(function ComponentDocsTabs({
  docs,
  componentId,
  examples,
}: ComponentDocsTabsProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const componentMeta = useMemo(
    () => componentsRegistry.find((component) => component.path === pathname),
    [pathname],
  );
  const tabsIdBase = useMemo(
    () =>
      componentId
        ? `docs-tabs-${componentId}`
        : `docs-tabs-${pathname.replaceAll("/", "-") || "root"}`,
    [componentId, pathname],
  );

  const { activeTab, setActiveTab } = useTabSearchParam<DocsTab>({
    defaultTab: "docs",
    validTabs: VALID_TABS,
    scrollTargetRef: contentRef,
    hashTrigger: "#examples",
  });

  const handleTabChange = useCallback(
    (value: string) => {
      if (value === "docs" || value === "examples") {
        if (componentMeta && value !== activeTab) {
          analytics.component.tabSwitched(componentMeta.id, value);
        }
        setActiveTab(value);
      }
    },
    [activeTab, componentMeta, setActiveTab],
  );

  return (
    <TabsPrimitive.Root
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex w-full flex-1 flex-col"
    >
      <div className="sticky top-12 z-30 flex items-center justify-center border-border/40 border-b bg-background/85 backdrop-blur-md">
        <TabsPrimitive.List className="flex">
          <TabsPrimitive.Trigger
            id={`${tabsIdBase}-trigger-docs`}
            aria-controls={`${tabsIdBase}-content-docs`}
            value="docs"
            className={tabTriggerClass}
          >
            Docs
          </TabsPrimitive.Trigger>
          <TabsPrimitive.Trigger
            id={`${tabsIdBase}-trigger-examples`}
            aria-controls={`${tabsIdBase}-content-examples`}
            value="examples"
            className={tabTriggerClass}
          >
            Examples
          </TabsPrimitive.Trigger>
        </TabsPrimitive.List>
      </div>

      <div
        id="examples"
        ref={contentRef}
        className="relative flex w-full flex-1 scroll-mt-24 flex-col"
      >
        <TabsPrimitive.Content
          id={`${tabsIdBase}-content-docs`}
          aria-labelledby={`${tabsIdBase}-trigger-docs`}
          value="docs"
          className="outline-none"
        >
          <div className="mx-auto w-full max-w-[1200px] px-4 pt-10 pb-24 sm:px-6 lg:px-10 xl:px-12">
            <DocsContent>{docs}</DocsContent>
          </div>
        </TabsPrimitive.Content>
        <TabsPrimitive.Content
          id={`${tabsIdBase}-content-examples`}
          aria-labelledby={`${tabsIdBase}-trigger-examples`}
          value="examples"
          className="flex w-full flex-1 flex-col outline-none"
        >
          <div className="flex min-h-[calc(100vh-7rem)] flex-col">
            {activeTab === "examples"
              ? (examples ??
                (componentId ? (
                  <LazyComponentPreview componentId={componentId} />
                ) : null))
              : null}
          </div>
        </TabsPrimitive.Content>
      </div>
    </TabsPrimitive.Root>
  );
});
