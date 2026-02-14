"use client";

import { useState, useCallback } from "react";
import Ansi from "ansi-to-react";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Terminal as TerminalIcon,
} from "lucide-react";
import type { TerminalProps } from "./schema";
import { useCopyToClipboard } from "../shared/use-copy-to-clipboard";

import { Button, Collapsible, CollapsibleTrigger } from "./_adapter";
import { cn } from "./_adapter";

const COPY_ID = "terminal-output";

type TerminalComponentProps = TerminalProps & {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

function formatDuration(durationMs?: number): string | null {
  if (durationMs == null) return null;
  if (durationMs < 1000) return `${Math.round(durationMs)}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
}

function countOutputLines(output: string): number {
  const trimmedTrailingNewlines = output.replace(/\n+$/, "");
  if (!trimmedTrailingNewlines) return 0;
  return trimmedTrailingNewlines.split("\n").length;
}

export function Terminal({
  id,
  command,
  stdout,
  stderr,
  exitCode,
  durationMs,
  cwd,
  truncated,
  maxCollapsedLines,
  className,
  expanded,
  defaultExpanded = false,
  onExpandedChange,
}: TerminalComponentProps) {
  const [uncontrolledExpanded, setUncontrolledExpanded] =
    useState(defaultExpanded);
  const { copiedId, copy } = useCopyToClipboard();

  const isExpanded = expanded ?? uncontrolledExpanded;

  const setExpanded = useCallback(
    (nextExpanded: boolean) => {
      if (expanded === undefined) {
        setUncontrolledExpanded(nextExpanded);
      }
      onExpandedChange?.(nextExpanded);
    },
    [expanded, onExpandedChange],
  );

  const isSuccess = exitCode === 0;
  const hasOutput = Boolean(stdout || stderr);
  const fullOutput = [stdout, stderr].filter(Boolean).join("\n");
  const formattedDuration = formatDuration(durationMs);

  const lineCount = countOutputLines(fullOutput);
  const shouldCollapse = maxCollapsedLines && lineCount > maxCollapsedLines;
  const isCollapsed = shouldCollapse && !isExpanded;

  const handleCopy = useCallback(() => {
    if (!hasOutput) return;
    copy(fullOutput, COPY_ID);
  }, [hasOutput, fullOutput, copy]);

  return (
    <div
      className={cn(
        "@container flex w-full min-w-80 flex-col gap-3",
        className,
      )}
      data-tool-ui-id={id}
      data-slot="terminal"
    >
      <div className="border-border bg-card overflow-hidden rounded-lg border shadow-xs">
        <div className="bg-card flex items-center justify-between border-b px-4 py-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <TerminalIcon className="text-muted-foreground h-4 w-4 shrink-0" />
            <code className="text-foreground truncate font-mono text-xs">
              {cwd && <span className="text-muted-foreground">{cwd}$ </span>}
              {command}
            </code>
          </div>
          <div className="flex items-center gap-3">
            {formattedDuration && (
              <span className="text-muted-foreground font-mono text-sm tabular-nums">
                {formattedDuration}
              </span>
            )}
            <span
              className={cn(
                "font-mono text-sm tabular-nums",
                isSuccess
                  ? "text-muted-foreground"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {exitCode}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!hasOutput}
              className="h-7 w-7 p-0"
              aria-label={
                !hasOutput
                  ? "No output to copy"
                  : copiedId === COPY_ID
                    ? "Copied"
                    : "Copy output"
              }
            >
              {hasOutput && copiedId === COPY_ID ? (
                <Check className="h-4 w-4 text-green-700 dark:text-green-400" />
              ) : (
                <Copy className="text-muted-foreground h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {hasOutput && (
          <Collapsible open={!isCollapsed}>
            <div
              className={cn(
                "relative font-mono text-sm",
                isCollapsed && "max-h-[200px] overflow-hidden",
              )}
            >
              <div className="overflow-x-auto p-4">
                {stdout && (
                  <div className="text-foreground break-all whitespace-pre-wrap">
                    <Ansi>{stdout}</Ansi>
                  </div>
                )}
                {stderr && (
                  <div className="mt-2 break-all whitespace-pre-wrap text-red-500 dark:text-red-400">
                    <Ansi>{stderr}</Ansi>
                  </div>
                )}
                {truncated && (
                  <div className="text-muted-foreground mt-2 text-xs italic">
                    Output truncated...
                  </div>
                )}
              </div>

              {isCollapsed && (
                <div className="from-card absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent" />
              )}
            </div>

            {shouldCollapse && (
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => setExpanded(!isExpanded)}
                  className="text-muted-foreground w-full rounded-none border-t font-normal"
                >
                  {isCollapsed ? (
                    <>
                      <ChevronDown className="mr-1 size-4" />
                      Show all {lineCount} lines
                    </>
                  ) : (
                    <>
                      <ChevronUp className="mr-1 size-4" />
                      Collapse
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            )}
          </Collapsible>
        )}

        {!hasOutput && (
          <div className="text-muted-foreground px-4 py-3 font-mono text-sm italic">
            No output
          </div>
        )}
      </div>

    </div>
  );
}
