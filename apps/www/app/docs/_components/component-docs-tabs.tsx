"use client";

import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/ui/cn";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocsBorderedShell } from "./docs-bordered-shell";
import { DocsContent } from "./docs-content";
import type { ComponentId } from "@/lib/docs/component-ids";
import { useTabSearchParam } from "@/hooks/use-tab-search-param";
import { analytics } from "@/lib/analytics";
import { componentsRegistry } from "@/lib/docs/component-registry";

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
      <div className="text-muted-foreground flex h-full w-full items-center justify-center text-sm">
        Loading examples...
      </div>
    ),
  },
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
    <DocsBorderedShell>
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="relative flex h-full min-h-0 flex-col gap-0"
      >
        <div
          className={cn(
            "absolute inset-x-0 top-0 z-20 flex items-center justify-center",
            "px-3 py-2 sm:px-6 sm:py-3",
          )}
        >
          <div
            className="from-background pointer-events-none absolute inset-x-0 top-0 -bottom-4 bg-linear-to-b to-transparent"
            aria-hidden="true"
          />
          <TabsList className="relative">
            <TabsTrigger
              id={`${tabsIdBase}-trigger-docs`}
              aria-controls={`${tabsIdBase}-content-docs`}
              value="docs"
            >
              Docs
            </TabsTrigger>
            <TabsTrigger
              id={`${tabsIdBase}-trigger-examples`}
              aria-controls={`${tabsIdBase}-content-examples`}
              value="examples"
            >
              Examples
            </TabsTrigger>
          </TabsList>
        </div>

        <div
          id="examples"
          ref={contentRef}
          className="relative flex min-h-0 flex-1 scroll-mt-16 flex-col"
        >
          <TabsContent
            id={`${tabsIdBase}-content-docs`}
            aria-labelledby={`${tabsIdBase}-trigger-docs`}
            value="docs"
            className="scrollbar-subtle h-full min-h-0 flex-1 overflow-y-auto pt-[52px] sm:pt-[60px]"
          >
            <div className="z-0 min-h-0 min-w-0 flex-1 px-4 pt-8 pb-24 sm:px-6 lg:px-10 xl:px-12 xl:pt-12">
              <DocsContent>{docs}</DocsContent>
            </div>
          </TabsContent>
          <TabsContent
            id={`${tabsIdBase}-content-examples`}
            aria-labelledby={`${tabsIdBase}-trigger-examples`}
            value="examples"
            className="flex h-full min-h-0 flex-1 flex-col overflow-hidden pt-[52px] sm:pt-[60px]"
          >
            {activeTab === "examples"
              ? (examples ??
                (componentId ? (
                  <LazyComponentPreview componentId={componentId} />
                ) : null))
              : null}
          </TabsContent>
        </div>
      </Tabs>
    </DocsBorderedShell>
  );
});
