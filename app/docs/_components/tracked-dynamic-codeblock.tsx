"use client";

import type { ReactNode } from "react";
import { useCallback } from "react";
import {
  DynamicCodeBlock,
  type DynamicCodeblockProps,
} from "fumadocs-ui/components/dynamic-codeblock";
import { analytics } from "@/lib/analytics";
import {
  detectInstallSnippetType,
  getDocsCodeCopySource,
} from "@/lib/docs/install-snippet-analytics";

export function TrackedDynamicCodeBlock({
  lang,
  code,
  codeblock,
  ...props
}: DynamicCodeblockProps) {
  const installSnippetType = detectInstallSnippetType(code);
  const source = getDocsCodeCopySource(installSnippetType);

  const Actions = useCallback(
    ({ className, children }: { className?: string; children?: ReactNode }) => (
      <div
        className={className}
        onClick={(event) => {
          const target = event.target as HTMLElement | null;
          const clickedCopyButton = target?.closest("button");
          if (!clickedCopyButton) return;

          analytics.code.blockCopied(lang, source);
          if (installSnippetType) {
            analytics.docs.installSnippetCopied(
              installSnippetType,
              "docs_code_block",
            );
          }
        }}
      >
        {children}
      </div>
    ),
    [installSnippetType, lang, source],
  );

  return (
    <DynamicCodeBlock
      lang={lang}
      code={code}
      codeblock={{ ...codeblock, Actions }}
      {...props}
    />
  );
}
