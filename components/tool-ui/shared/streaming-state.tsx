"use client";

import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "./_adapter";
import type { StreamingToolRenderState } from "./streaming-render";

type SharedStreamingState = StreamingToolRenderState<unknown, unknown>;

export interface ToolRenderStateProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  state: SharedStreamingState;
  partialLabel?: string;
}

function statusLabel(state: SharedStreamingState): string {
  if (state.kind === "error") {
    if (
      state.isCancelled ||
      (state.status.type === "incomplete" && state.status.reason === "cancelled")
    ) {
      return "Cancelled";
    }
    return "Failed";
  }

  if (state.kind === "loading") {
    return state.status.type === "requires-action"
      ? "Awaiting Input"
      : "Working";
  }

  if (state.kind === "partial") {
    return "Streaming";
  }

  return "Complete";
}

/**
 * Shared render-state status UI for assistant-ui toolkit render functions.
 *
 * - `loading` / `error`: full status card for placeholder/fallback states.
 * - `partial`: compact badge (for streamed partial output while rendering).
 * - `ready`: renders `null`.
 */
export function ToolRenderState({
  state,
  className,
  partialLabel = "Streaming partial output",
  ...props
}: ToolRenderStateProps) {
  if (state.kind === "ready") {
    return null;
  }

  if (state.kind === "partial") {
    return (
      <div
        className={cn(
          "bg-muted/70 text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
          className,
        )}
        data-slot="streaming-state"
        data-tool-ui-streaming-state="partial"
        role="status"
        aria-live="polite"
        {...props}
      >
        <Sparkles className="size-3.5" aria-hidden="true" />
        <span>{partialLabel}</span>
      </div>
    );
  }

  const isError = state.kind === "error";
  const Icon = isError ? AlertCircle : Loader2;

  return (
    <div
      className={cn(
        "bg-card/60 flex w-full min-w-80 max-w-md flex-col gap-2 rounded-2xl border px-5 py-4 shadow-xs",
        isError && "border-destructive/30",
        className,
      )}
      data-slot="streaming-state"
      data-tool-ui-streaming-state={state.kind}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      {...props}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn("size-4", isError ? "text-destructive" : "animate-spin")}
          aria-hidden="true"
        />
        <p
          className={cn(
            "text-sm font-medium",
            isError ? "text-destructive" : "text-foreground",
          )}
        >
          {statusLabel(state)}
        </p>
      </div>
      <p className="text-muted-foreground text-sm">{state.message}</p>
    </div>
  );
}
