"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, FileCode } from "lucide-react";
import type { WeatherCondition } from "@/components/tool-ui/weather-widget/schema";
import type { CheckpointOverrides } from "../../weather-compositor/presets";

interface ExportPanelProps {
  checkpointOverrides: Partial<Record<WeatherCondition, CheckpointOverrides>>;
  signedOff: Set<WeatherCondition>;
  onApplied?: () => void;
  onRecovered?: (checkpointOverrides: Partial<Record<WeatherCondition, CheckpointOverrides>>) => void;
}

export function ExportPanel({
  checkpointOverrides,
  signedOff,
  onApplied,
  onRecovered,
}: ExportPanelProps) {
  const [applyStatus, setApplyStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [applyError, setApplyError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleRecover = async () => {
    setApplyError(null);
    try {
      const response = await fetch("/api/weather-tuning/recover");
      if (!response.ok) {
        const message = await response.text();
        setApplyError(message || "Failed to recover tuning.");
        return;
      }
      const payload = (await response.json()) as {
        checkpointOverrides?: Partial<Record<WeatherCondition, CheckpointOverrides>>;
      };
      if (!payload?.checkpointOverrides) {
        setApplyError("No recovered presets returned.");
        return;
      }
      onRecovered?.(payload.checkpointOverrides);
      setToast("Recovered tuning from repo presets");
    } catch (error) {
      console.error("Failed to recover tuning.", error);
      setApplyError("Failed to recover tuning.");
    }
  };

  const handleApply = async () => {
    setApplyStatus("saving");
    setApplyError(null);
    try {
      const hasAnyDelta = Object.values(checkpointOverrides).some((byCheckpoint) => {
        if (!byCheckpoint) return false;
        return Object.values(byCheckpoint).some((checkpointData) => {
          return checkpointData && Object.keys(checkpointData).length > 0;
        });
      });

      if (!hasAnyDelta) {
        setApplyStatus("error");
        setApplyError("No tuning changes to apply yet.");
        return;
      }

      const response = await fetch("/api/weather-tuning/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkpointOverrides,
          signedOff: Array.from(signedOff),
        }),
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

      setToast(`Applied tuning → ${filePath}`);
      setApplyStatus("success");
      try {
        onApplied?.();
      } catch (error) {
        console.error("onApplied() failed after apply.", error);
      }
      setTimeout(() => setApplyStatus("idle"), 2000);
    } catch (error) {
      console.error("Failed to apply export.", error);
      setApplyStatus("error");
      setApplyError("Failed to apply export.");
      setToast("Failed to apply tuning");
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleRecover}
          disabled={applyStatus === "saving"}
        >
          <FileCode className="size-4" />
          Recover from repo
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleApply}
          disabled={applyStatus === "saving"}
        >
          <FileCode className="size-4" />
          {applyStatus === "saving"
            ? "Applying…"
            : applyStatus === "success"
              ? "Applied"
              : "Apply to repo"}
          {applyStatus === "success" && <Check className="size-4 text-emerald-400" />}
        </Button>
      </div>
      {applyError && (
        <span className="ml-2 text-xs text-red-500/80">{applyError}</span>
      )}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-md border border-border/60 bg-background px-3 py-2 text-xs shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
