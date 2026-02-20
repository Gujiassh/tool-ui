"use client";

import type { MouseEventHandler } from "react";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { Check, Copy as CopyIcon, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";

type InstallCommandLineProps = {
  componentId: string;
};

export function InstallCommandLine({ componentId }: InstallCommandLineProps) {
  const installCommand = `npx shadcn@latest add @tool-ui/${componentId}`;
  const [checked, copyCommand] = useCopyButton(async () => {
    await navigator.clipboard.writeText(installCommand);
  });

  const onClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    analytics.code.blockCopied("bash", "docs_header");
    analytics.docs.installSnippetCopied("registry", "docs_header");
    copyCommand(event);
  };

  return (
    <div className="bg-muted/40 border-border mt-2 flex items-center justify-between gap-3 rounded-md border px-3 py-2">
      <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm">
        <Terminal className="size-4 shrink-0" />
        <code className="text-foreground block truncate font-mono text-sm">
          {installCommand}
        </code>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClick}
        aria-label={checked ? "Copied install command" : "Copy install command"}
        className="shrink-0 gap-2"
      >
        {checked ? <Check className="size-4" /> : <CopyIcon className="size-4" />}
        {checked ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
