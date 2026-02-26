"use client";

import type { MouseEventHandler } from "react";
import Link from "next/link";
import { Check, Copy as CopyIcon } from "lucide-react";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
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
  const installCommand = `npx shadcn@latest add @tool-ui/${componentId}`;
  const usageCode = getGalleryUsageCode(componentId);

  const [checked, copyCommand] = useCopyButton(async () => {
    await navigator.clipboard.writeText(installCommand);
  });

  const onCopy: MouseEventHandler<HTMLButtonElement> = (event) => {
    analytics.code.blockCopied("bash", "docs_header");
    analytics.docs.installSnippetCopied("registry", "docs_header");
    copyCommand(event);
  };

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
        <div className="pointer-events-none translate-y-0.5 opacity-0 transition-all duration-200 focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100 group-focus-within/gallery-card:pointer-events-auto group-focus-within/gallery-card:translate-y-0 group-focus-within/gallery-card:opacity-100 group-hover/gallery-card:pointer-events-auto group-hover/gallery-card:translate-y-0 group-hover/gallery-card:opacity-100">
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
                  <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5">
                    <code className="text-foreground/95 min-w-0 flex-1 break-all font-mono text-sm leading-relaxed">
                      {installCommand}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 px-2.5"
                      onClick={onCopy}
                      aria-label={checked ? "Copied" : "Copy command"}
                    >
                      {checked ? (
                        <Check className="size-4 text-green-600" />
                      ) : (
                        <CopyIcon className="size-4" />
                      )}
                    </Button>
                  </div>
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
