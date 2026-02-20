"use client";

import type { MouseEventHandler } from "react";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, Copy as CopyIcon, Terminal, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GalleryDocsLink } from "./gallery-docs-link";
import { GalleryPopup } from "./gallery-popup";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { GalleryComponentDocId } from "@/lib/docs/gallery-component-docs";
import { analytics } from "@/lib/analytics";

interface GalleryInstallStripProps {
  componentId: GalleryComponentDocId;
  componentName: string;
  docsHref: `/docs/${string}`;
  usageCode: string;
  installCommand: string;
}

export function GalleryInstallStrip({
  componentId,
  componentName,
  docsHref,
  usageCode,
  installCommand,
}: GalleryInstallStripProps) {
  const [checked, copyCommand] = useCopyButton(async () => {
    await navigator.clipboard.writeText(installCommand);
  });

  const onCopy: MouseEventHandler<HTMLButtonElement> = (event) => {
    analytics.code.blockCopied("bash", "docs_header");
    analytics.docs.installSnippetCopied("registry", "docs_header");
    copyCommand(event);
  };

  return (
    <div className="pointer-events-auto rounded-md border border-border/60 bg-background/75 px-2 py-1.5 text-foreground/85 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-2">
        <GalleryDocsLink
          componentId={componentId}
          label={componentName}
          href={docsHref}
          className="text-foreground/65 hover:text-foreground"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5 text-foreground/60 hover:text-foreground"
              aria-label={`How to use ${componentName}`}
              title="How to use"
            >
              <CircleHelp className="size-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            sideOffset={8}
            className="w-[min(92vw,640px)] border-neutral-700/80 bg-neutral-950/96 p-0 dark:border-neutral-300/70 dark:bg-neutral-50/96"
          >
            <GalleryPopup
              componentId={componentId}
              componentName={componentName}
              docsHref={docsHref}
              usageCode={usageCode}
              installCommand={installCommand}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="mt-1 flex items-center gap-1.5 rounded-sm border border-border/50 bg-muted/55 px-1.5 py-0.5">
        <Terminal className="size-2.5 shrink-0 text-foreground/45" />
        <code className="min-w-0 flex-1 truncate font-mono text-[9px] text-foreground/70">
          {installCommand}
        </code>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-4 shrink-0 px-1 text-[9px] text-foreground/55 hover:text-foreground/80"
          onClick={onCopy}
          aria-label={checked ? "Copied install command" : "Copy install command"}
          title={checked ? "Copied" : "Copy install command"}
        >
          {checked ? (
            <Check className="mr-1 size-3" />
          ) : (
            <CopyIcon className="mr-1 size-3" />
          )}
          {checked ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
