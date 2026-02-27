"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { componentsRegistry } from "@/lib/docs/component-registry";
import { getGalleryUsageCode } from "@/lib/docs/gallery-usage-code";
import type { GalleryComponentDocId } from "@/lib/docs/gallery-component-docs";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/ui/cn";
import { TrackedDynamicCodeBlock } from "./tracked-dynamic-codeblock";
import { InstallCommandBlock } from "./install-command-block";

const registryById = new Map(componentsRegistry.map((c) => [c.id, c]));

interface GalleryCardHeaderProps {
  componentId: GalleryComponentDocId;
  className?: string;
  hideDescription?: boolean;
}

export function GalleryCardHeader({
  componentId,
  className,
  hideDescription = false,
}: GalleryCardHeaderProps) {
  const meta = registryById.get(componentId);
  const name = meta?.label ?? componentId;
  const description = meta?.description;
  const docsHref = (meta?.path ?? `/docs/${componentId}`) as `/docs/${string}`;
  const usageCode = getGalleryUsageCode(componentId);

  return (
    <header
      className={cn("flex w-full min-w-0 flex-col gap-1.5 px-1", className)}
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <Link
          href={docsHref}
          className="text-muted-foreground shrink-0 rounded-md px-0.5 text-xs font-mono tracking-wide underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => {
            analytics.gallery.componentClicked(componentId);
            analytics.docs.navigationClicked(name, docsHref);
          }}
        >
          <h2>{name}</h2>
        </Link>
        <div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 shrink-0 gap-1.5 border border-transparent px-2 font-mono text-[11px] text-muted-foreground hover:border-border/60 hover:text-foreground"
              >
                Install & use
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-full flex-col gap-0 sm:max-w-2xl"
            >
              <SheetHeader className="shrink-0 border-b border-border/50 pb-4 pr-10">
                <SheetTitle className="text-lg">Code</SheetTitle>
                <SheetDescription className="text-sm">
                  Copy the command to install, then use the example in your app.
                </SheetDescription>
              </SheetHeader>
              <div className="scrollbar-subtle flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
                <section className="space-y-2">
                  <h3 className="text-foreground text-sm font-medium">
                    Install
                  </h3>
                  <InstallCommandBlock
                    componentId={componentId}
                    variant="block"
                  />
                </section>
                {usageCode && (
                  <section className="flex min-h-0 flex-1 flex-col space-y-2">
                    <h3 className="text-foreground text-sm font-medium">
                      Example
                    </h3>
                    <div className="scrollbar-subtle min-h-[200px] flex-1 overflow-auto rounded-lg border border-border/60 bg-muted/50 [&_pre]:!rounded-lg [&_pre]:!border-0 [&_pre]:!bg-transparent [&_pre]:!p-4 [&_pre]:!text-sm [&_pre]:!leading-relaxed">
                      <TrackedDynamicCodeBlock
                        lang="tsx"
                        code={usageCode}
                        copyButtonLabel="gallery usage example"
                      />
                    </div>
                  </section>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {!hideDescription && description && (
        <p className="text-muted-foreground text-xs">{description}</p>
      )}
    </header>
  );
}
