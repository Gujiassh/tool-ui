"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileCode, Check, Eye } from "lucide-react";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import type { CheckpointOverrides } from "../../weather-compositor/presets";
import { useCodeGen } from "../hooks/use-code-gen";

interface ExportPanelProps {
  checkpointOverrides: Partial<Record<WeatherCondition, CheckpointOverrides>>;
  signedOff: Set<WeatherCondition>;
  hasOffCheckpointKeyframes?: boolean;
}

export function ExportPanel({
  checkpointOverrides,
  signedOff,
  hasOffCheckpointKeyframes,
}: ExportPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [applyStatus, setApplyStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [diffStatus, setDiffStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [diffText, setDiffText] = useState<string | null>(null);
  const [diffError, setDiffError] = useState<string | null>(null);
  const [diffTruncated, setDiffTruncated] = useState(false);
  const {
    copyToClipboard,
    downloadFile,
    generateToolUiTypeScript,
  } = useCodeGen(checkpointOverrides, signedOff);

  const handleCopy = async (
    format: "json-overrides" | "json-full" | "typescript" | "typescript-tool-ui"
  ) => {
    setCopyError(null);
    const ok = await copyToClipboard({ format, includeMetadata: format === "json-full" });
    if (!ok) {
      setCopyError("Copy blocked by the browser. Downloaded instead.");
      downloadFile({ format, includeMetadata: format === "json-full" });
      setTimeout(() => setCopyError(null), 4000);
      return;
    }
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = (
    format: "json-overrides" | "json-full" | "typescript" | "typescript-tool-ui"
  ) => {
    downloadFile({ format, includeMetadata: format === "json-full" });
  };

  const handleApply = async () => {
    setApplyStatus("saving");
    setApplyError(null);
    setApplyMessage(null);
    try {
      const content = generateToolUiTypeScript();
      const response = await fetch("/api/weather-tuning/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const message = await response.text();
        setApplyStatus("error");
        setApplyError(message || "Failed to apply export.");
        return;
      }

      const payload = (await response.json()) as { path?: string };
      const filePath =
        typeof payload?.path === "string"
          ? payload.path
          : "components/tool-ui/weather-widget/effects/tuned-presets.ts";

      setApplyMessage(`Wrote ${filePath}`);
      setToast(`Applied tuning → ${filePath}`);
      setApplyStatus("success");
      setTimeout(() => setApplyStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to apply export.", error);
      setApplyStatus("error");
      setApplyError("Failed to apply export.");
    }
  };

  const handlePreviewDiff = async () => {
    setDiffStatus("loading");
    setDiffError(null);
    setDiffText(null);
    setDiffTruncated(false);
    try {
      const content = generateToolUiTypeScript();
      const response = await fetch("/api/weather-tuning/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const message = await response.text();
        setDiffStatus("error");
        setDiffError(message || "Failed to load diff.");
        return;
      }

      const payload = (await response.json()) as {
        diff?: string;
        changed?: boolean;
        truncated?: boolean;
      };

      if (!payload.changed) {
        setDiffText("No changes.");
      } else {
        setDiffText(payload.diff ?? "");
      }
      setDiffTruncated(Boolean(payload.truncated));
      setDiffStatus("ready");
    } catch (error) {
      console.error("Failed to load diff.", error);
      setDiffStatus("error");
      setDiffError("Failed to load diff.");
    }
  };

  const overrideCount = Object.keys(checkpointOverrides).length;

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="size-4" />
          Export
          {overrideCount > 0 && (
            <span className="rounded bg-zinc-700 px-1.5 py-0.5 text-xs">
              {overrideCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Copy to Clipboard</DropdownMenuLabel>
        {copyError && (
          <DropdownMenuItem disabled className="opacity-100 text-red-400">
            {copyError}
          </DropdownMenuItem>
        )}
        {hasOffCheckpointKeyframes && (
          <>
            <DropdownMenuItem disabled className="opacity-100 text-amber-400">
              Keyframes snap to the nearest checkpoint on export.
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => handleCopy("json-overrides")}>
          <FileJson className="mr-2 size-4" />
          <span className="flex-1">JSON (overrides only)</span>
          {copied === "json-overrides" && <Check className="size-4 text-emerald-400" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopy("json-full")}>
          <FileJson className="mr-2 size-4" />
          <span className="flex-1">JSON (with metadata)</span>
          {copied === "json-full" && <Check className="size-4 text-emerald-400" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopy("typescript")}>
          <FileCode className="mr-2 size-4" />
          <span className="flex-1">TypeScript</span>
          {copied === "typescript" && <Check className="size-4 text-emerald-400" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleCopy("typescript-tool-ui")}>
          <FileCode className="mr-2 size-4" />
          <span className="flex-1">TypeScript (Tool UI)</span>
          {copied === "typescript-tool-ui" && <Check className="size-4 text-emerald-400" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Download File</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleDownload("json-overrides")}>
          <Download className="mr-2 size-4" />
          weather-tuning-export.json
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("typescript")}>
          <Download className="mr-2 size-4" />
          tuned-overrides.ts
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("typescript-tool-ui")}>
          <Download className="mr-2 size-4" />
          tuned-presets.ts
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Apply to Repo</DropdownMenuLabel>
        {applyError && (
          <DropdownMenuItem disabled className="opacity-100 text-red-400">
            {applyError}
          </DropdownMenuItem>
        )}
        {applyMessage && applyStatus === "success" && (
          <DropdownMenuItem disabled className="opacity-100 text-emerald-400">
            {applyMessage}
          </DropdownMenuItem>
        )}
        {diffError && (
          <DropdownMenuItem disabled className="opacity-100 text-red-400">
            {diffError}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handlePreviewDiff}>
          <Eye className="mr-2 size-4" />
          <span className="flex-1">Preview diff</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleApply} disabled={applyStatus === "saving"}>
          <FileCode className="mr-2 size-4" />
          <span className="flex-1">Write tuned-presets.ts</span>
          {applyStatus === "success" && <Check className="size-4 text-emerald-400" />}
        </DropdownMenuItem>
        {diffStatus === "loading" && (
          <DropdownMenuItem disabled className="opacity-100 text-muted-foreground">
            Loading diff…
          </DropdownMenuItem>
        )}
        {diffText && diffStatus === "ready" && (
          <div className="max-h-64 overflow-auto px-2 py-2 text-[10px] text-muted-foreground/80">
            <pre className="whitespace-pre-wrap">{diffText}</pre>
            {diffTruncated && (
              <div className="mt-2 text-[10px] text-muted-foreground/60">
                Diff truncated.
              </div>
            )}
          </div>
        )}
      </DropdownMenuContent>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-md border border-border/60 bg-background px-3 py-2 text-xs shadow-lg">
          {toast}
        </div>
      )}
    </DropdownMenu>
  );
}
