"use client";

import type { MouseEventHandler } from "react";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, Copy as CopyIcon, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GalleryDocsLink } from "./gallery-docs-link";
import type { GalleryComponentDocId } from "@/lib/docs/gallery-component-docs";
import { analytics } from "@/lib/analytics";

interface GalleryInstallStripProps {
  componentId: GalleryComponentDocId;
  componentName: string;
  docsHref: `/docs/${string}`;
}

export function GalleryInstallStrip({
  componentId,
  componentName,
  docsHref,
}: GalleryInstallStripProps) {
  const installCommand = `npx shadcn@latest add @tool-ui/${componentId}`;
  const [checked, copyCommand] = useCopyButton(async () => {
    await navigator.clipboard.writeText(installCommand);
  });

  const onCopy: MouseEventHandler<HTMLButtonElement> = (event) => {
    analytics.code.blockCopied("bash", "docs_header");
    analytics.docs.installSnippetCopied("registry", "docs_header");
    copyCommand(event);
  };

  return (
    <div className="pointer-events-auto rounded-xl border border-neutral-700/70 bg-neutral-900/90 px-3 py-2 text-neutral-100 shadow-sm backdrop-blur-sm dark:border-neutral-300/80 dark:bg-neutral-100/90 dark:text-neutral-900">
      <GalleryDocsLink
        componentId={componentId}
        label={componentName}
        href={docsHref}
        className="text-neutral-200/90 hover:text-white dark:text-neutral-700 dark:hover:text-neutral-950"
      />

      <div className="mt-2 flex items-center gap-2 rounded-md border border-neutral-700/60 bg-neutral-800/70 px-2 py-1.5 dark:border-neutral-300/70 dark:bg-neutral-50">
        <Terminal className="size-3.5 shrink-0 text-neutral-300 dark:text-neutral-600" />
        <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-neutral-100 dark:text-neutral-900">
          {installCommand}
        </code>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-6 shrink-0 px-2 text-[11px]"
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
