"use client";

import {
  DynamicCodeBlock,
  type DynamicCodeblockProps,
} from "fumadocs-ui/components/dynamic-codeblock";
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
} from "react";
import { analytics } from "@/lib/analytics";
import {
  detectInstallSnippetType,
  getDocsCodeCopySource,
} from "@/lib/docs/install-snippet-analytics";

type InstallSnippetType = ReturnType<typeof detectInstallSnippetType>;

type TrackedDynamicCodeBlockProps = DynamicCodeblockProps & {
  copyButtonLabel?: string;
};

type CopyButtonElementProps = {
  "aria-label"?: string;
  children?: ReactNode;
  containerRef?: unknown;
  "data-checked"?: unknown;
  title?: string;
};

function resolveSnippetPreview(code: string): string {
  const firstLine = code
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (!firstLine) {
    return "code snippet";
  }

  const normalized = firstLine.replace(/\s+/g, " ");
  return normalized.length > 60 ? `${normalized.slice(0, 57)}...` : normalized;
}

function resolveInstallCopyLabel(type: InstallSnippetType): string | null {
  if (type === "registry") {
    return "registry install command";
  }

  if (type === "skills") {
    return "skills install command";
  }

  if (type === "package_manager") {
    return "package manager install command";
  }

  return null;
}

function resolveCopyContextLabel({
  code,
  lang,
  installSnippetType,
  copyButtonLabel,
}: {
  code: string;
  lang: string;
  installSnippetType: InstallSnippetType;
  copyButtonLabel?: string;
}): string {
  if (copyButtonLabel?.trim()) {
    return copyButtonLabel.trim();
  }

  const installLabel = resolveInstallCopyLabel(installSnippetType);
  if (installLabel) {
    return installLabel;
  }

  const language = lang.trim().length > 0 ? lang.toUpperCase() : "CODE";
  return `${language} snippet: ${resolveSnippetPreview(code)}`;
}

function relabelCopyButtons(
  children: ReactNode,
  contextLabel: string,
): ReactNode {
  return Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }

    const element = child as ReactElement<CopyButtonElementProps>;
    const currentAriaLabel = element.props["aria-label"];
    const nestedChildren = element.props.children;
    const relabeledChildren = nestedChildren
      ? relabelCopyButtons(nestedChildren, contextLabel)
      : nestedChildren;
    const isFumadocsCopyButton =
      typeof element.type === "string" &&
      element.type === "button" &&
      (currentAriaLabel === "Copy Text" || currentAriaLabel === "Copied Text");
    const isFumadocsCopyButtonComponent =
      typeof element.type !== "string" && "containerRef" in element.props;

    if (isFumadocsCopyButton) {
      const isCopied = Boolean(element.props["data-checked"]);
      const action = isCopied ? "Copied" : "Copy";
      const ariaLabel = `${action} ${contextLabel}`;

      return cloneElement(
        element,
        {
          "aria-label": ariaLabel,
          title: ariaLabel,
        },
        relabeledChildren,
      );
    }

    if (isFumadocsCopyButtonComponent) {
      const ariaLabel = `Copy ${contextLabel}`;
      return cloneElement(element, {
        "aria-label": ariaLabel,
        title: ariaLabel,
      });
    }

    if (relabeledChildren !== nestedChildren) {
      return cloneElement(element, undefined, relabeledChildren);
    }

    return child;
  });
}

export function TrackedDynamicCodeBlock({
  lang,
  code,
  codeblock,
  copyButtonLabel,
  ...props
}: TrackedDynamicCodeBlockProps) {
  const installSnippetType = detectInstallSnippetType(code);
  const source = getDocsCodeCopySource(installSnippetType);
  const copyContextLabel = resolveCopyContextLabel({
    code,
    lang,
    installSnippetType,
    copyButtonLabel,
  });

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
        {relabelCopyButtons(children, copyContextLabel)}
      </div>
    ),
    [copyContextLabel, installSnippetType, lang, source],
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
