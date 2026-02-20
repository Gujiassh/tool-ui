"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Copy, Code2, Sparkles } from "lucide-react";
import { GalleryDocsLink } from "./gallery-docs-link";
import { cn } from "@/lib/ui/cn";
import { analytics } from "@/lib/analytics";
import type { GalleryComponentDocId } from "@/lib/docs/gallery-component-docs";

interface GalleryPopupProps {
  componentId: GalleryComponentDocId;
  componentName: string;
  docsHref: `/docs/${string}`;
  usageCode: string;
  installCommand: string;
  className?: string;
}

export function GalleryPopup({
  componentId,
  componentName,
  docsHref,
  usageCode,
  installCommand,
  className,
}: GalleryPopupProps) {
  const [copiedType, setCopiedType] = useState<"code" | "install" | null>(null);

  const copyInstallCommand = async () => {
    await navigator.clipboard.writeText(installCommand);
    setCopiedType("install");
    analytics.code.blockCopied("bash", "docs_header");
    analytics.docs.installSnippetCopied("registry", "docs_header");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(usageCode);
    setCopiedType("code");
    analytics.code.blockCopied("tsx", "component_preview");
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-xl p-4 text-neutral-100 dark:text-neutral-900",
        className,
      )}
    >
      <div className="mb-2">
        <h3 className="text-sm font-semibold tracking-tight">Installation</h3>
        <div className="mt-2 flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1.5 dark:border-neutral-300 dark:bg-neutral-100">
          <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-emerald-300 dark:text-emerald-700">
            {installCommand}
          </code>
          <button
            onClick={copyInstallCommand}
            className="inline-flex items-center gap-1 rounded-md border border-neutral-700 px-2 py-1 text-[11px] font-medium text-neutral-200 transition-colors hover:bg-neutral-800 dark:border-neutral-300 dark:text-neutral-800 dark:hover:bg-neutral-200"
            title="Copy install command"
          >
            {copiedType === "install" ? (
              <Check className="size-3" />
            ) : (
              <Copy className="size-3" />
            )}
            {copiedType === "install" ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="mb-2">
        <h3 className="text-sm font-semibold tracking-tight">How to use</h3>
      </div>

      <div className="mb-2 flex items-center gap-2">
        <button
          onClick={copyCode}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-neutral-800 dark:border-neutral-300 dark:text-neutral-800 dark:hover:bg-neutral-200"
          title="Copy code"
        >
          {copiedType === "code" ? (
            <Check className="size-3.5" />
          ) : (
            <Code2 className="size-3.5" />
          )}
          {copiedType === "code" ? "Copied code" : "Copy code"}
        </button>

        <Link
          href={docsHref}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-neutral-800 dark:border-neutral-300 dark:text-neutral-800 dark:hover:bg-neutral-200"
        >
          <Sparkles className="size-3.5" />
          View code
        </Link>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 dark:border-neutral-300 dark:bg-neutral-100">
        <pre className="scrollbar-subtle max-h-56 overflow-auto p-3 text-[11px] leading-5 text-neutral-200 dark:text-neutral-800">
          <code>{usageCode}</code>
        </pre>
      </div>

      <GalleryDocsLink
        componentId={componentId}
        label={componentName}
        href={docsHref}
        className="mt-2 inline-flex whitespace-nowrap text-neutral-400 hover:text-neutral-200 dark:text-neutral-600 dark:hover:text-neutral-900"
      />
    </div>
  );
}