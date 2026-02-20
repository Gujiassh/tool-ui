"use client";

import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import { GalleryDocsLink } from "./gallery-docs-link";
import { cn } from "@/lib/ui/cn";
import { analytics } from "@/lib/analytics";

interface GalleryPopupProps {
  componentId: string;
  componentName: string;
  docsHref: string;
  className?: string;
}

export function GalleryPopup({
  componentId,
  componentName,
  docsHref,
  className,
}: GalleryPopupProps) {
  const [copiedType, setCopiedType] = useState<"prompt" | "install" | null>(null);

  const copyPrompt = async () => {
    const prompt = `Add a ${componentName} component to my project`;
    await navigator.clipboard.writeText(prompt);
    setCopiedType("prompt");
    analytics.gallery.promptCopied(componentId);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyInstallCommand = async () => {
    const command = `npx shadcn@latest add https://tool-ui.com/registry/${componentId}.json`;
    await navigator.clipboard.writeText(command);
    setCopiedType("install");
    analytics.gallery.installCommandCopied(componentId);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <GalleryDocsLink
        componentId={componentId}
        label={componentName}
        href={docsHref}
        className="pointer-events-auto inline-flex items-center gap-1 whitespace-nowrap text-neutral-200/90 hover:text-white focus-visible:outline-none dark:text-neutral-700 dark:hover:text-neutral-950"
      />
      
      <div className="flex items-center gap-1 border-t border-neutral-700/50 pt-2 dark:border-neutral-300/50">
        <button
          onClick={copyPrompt}
          className="pointer-events-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-800/50 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500 dark:text-neutral-600 dark:hover:bg-neutral-200/50 dark:hover:text-neutral-950"
          title="Copy prompt"
        >
          {copiedType === "prompt" ? (
            <Check className="size-3" />
          ) : (
            <Copy className="size-3" />
          )}
          <span className="whitespace-nowrap">
            {copiedType === "prompt" ? "Copied!" : "Copy prompt"}
          </span>
        </button>
        
        <span className="text-neutral-500" aria-hidden="true">•</span>
        
        <button
          onClick={copyInstallCommand}
          className="pointer-events-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-neutral-300 transition-colors hover:bg-neutral-800/50 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-500 dark:text-neutral-600 dark:hover:bg-neutral-200/50 dark:hover:text-neutral-950"
          title="Copy install command"
        >
          {copiedType === "install" ? (
            <Check className="size-3" />
          ) : (
            <Download className="size-3" />
          )}
          <span className="whitespace-nowrap">
            {copiedType === "install" ? "Copied!" : "Add to project"}
          </span>
        </button>
      </div>
    </div>
  );
}