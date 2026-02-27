"use client";

import type { MouseEventHandler } from "react";
import { Check, Copy as CopyIcon } from "lucide-react";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import {
  detectInstallSnippetType,
  getDocsCodeCopySource,
} from "@/lib/docs/install-snippet-analytics";
import { componentsRegistry } from "@/lib/docs/component-registry";
import { cn } from "@/lib/ui/cn";

const registryById = new Map(componentsRegistry.map((c) => [c.id, c]));

interface InstallCommandBlockProps {
  componentId: string;
  className?: string;
  /** Compact single-line style (e.g. docs header) vs full block (e.g. gallery sheet) */
  variant?: "compact" | "block";
  /** Override tool-agent prompt when component not in registry (e.g. quick-start) */
  toolAgentPrompt?: string;
}

function CopyableCommand({
  command,
  source,
  variant,
}: {
  command: string;
  source: "docs_installation" | "docs_code_block";
  variant: "compact" | "block";
}) {
  const installSnippetType = detectInstallSnippetType(command);
  const copySource = getDocsCodeCopySource(installSnippetType);

  const [checked, copyCommand] = useCopyButton(async () => {
    await navigator.clipboard.writeText(command);
  });

  const onCopy: MouseEventHandler<HTMLButtonElement> = (event) => {
    analytics.code.blockCopied("bash", copySource);
    if (installSnippetType) {
      analytics.docs.installSnippetCopied(installSnippetType, source);
    }
    copyCommand(event);
  };

  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "group/install flex items-center gap-2 overflow-hidden rounded-lg",
        isCompact
          ? "bg-muted/50 pl-4 pr-2.5 py-1.5"
          : "border border-border/60 bg-muted/40 px-3 py-2.5",
      )}
    >
      <code
        className={cn(
          "text-muted-foreground group-hover/install:text-foreground min-w-0 flex-1 break-all font-mono transition-colors duration-200",
          isCompact ? "text-xs" : "text-sm leading-relaxed",
        )}
      >
        {command}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "shrink-0 px-2 opacity-60 group-hover/install:opacity-100 transition-opacity duration-200",
          isCompact ? "h-7" : "h-8 px-2.5",
        )}
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

export function InstallCommandBlock({
  componentId,
  className,
  variant = "compact",
  toolAgentPrompt: promptOverride,
}: InstallCommandBlockProps) {
  const meta = registryById.get(componentId);
  const toolAgentPrompt =
    promptOverride ??
    meta?.toolAgentPrompt ??
    `integrate the ${componentId} component`;
  const toolAgentCommand = `npx tool-agent "${toolAgentPrompt}"`;
  const shadcnCommand = `npx shadcn@latest add @tool-ui/${componentId}`;

  return (
    <div className={cn("space-y-2", className)}>
      <Tabs items={["tool-agent", "shadcn"]}>
        <Tab value="tool-agent">
          <CopyableCommand
            command={toolAgentCommand}
            source="docs_header"
            variant={variant}
          />
        </Tab>
        <Tab value="shadcn">
          <CopyableCommand
            command={shadcnCommand}
            source="docs_header"
            variant={variant}
          />
        </Tab>
      </Tabs>
    </div>
  );
}
