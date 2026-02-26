"use client";

import type { MouseEventHandler } from "react";
import { Check, Copy as CopyIcon } from "lucide-react";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import {
  detectInstallSnippetType,
  getDocsCodeCopySource,
} from "@/lib/docs/install-snippet-analytics";
import { cn } from "@/lib/ui/cn";

interface InstallCommandLineProps {
  componentId: string;
  className?: string;
}

export function InstallCommandLine({
  componentId,
  className,
}: InstallCommandLineProps) {
  const installCommand = `npx shadcn@latest add @tool-ui/${componentId}`;
  const installSnippetType = detectInstallSnippetType(installCommand);
  const source = getDocsCodeCopySource(installSnippetType);

  const [checked, copyCommand] = useCopyButton(async () => {
    await navigator.clipboard.writeText(installCommand);
  });

  const onCopy: MouseEventHandler<HTMLButtonElement> = (event) => {
    analytics.code.blockCopied("bash", source);
    if (installSnippetType) {
      analytics.docs.installSnippetCopied(installSnippetType, "docs_header");
    }
    copyCommand(event);
  };

  return (
    <div
      className={cn(
        "group/install-command-line flex items-center gap-2 overflow-hidden rounded-lg bg-muted/50 pl-4 pr-2.5 py-1.5",
        className,
      )}
    >
      <div className="text-muted-foreground group-hover/install-command-line:text-foreground transition-colors duration-200 min-w-0 flex-1 break-all font-mono text-xs">
        {installCommand}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 shrink-0 px-2 opacity-60 group-hover/install-command-line:opacity-100 transition-opacity duration-200"
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
  );
}
