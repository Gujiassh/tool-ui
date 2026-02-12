"use client";

import { useEffect, useState } from "react";
import { ActionButtons } from "./action-buttons";
import type { LocalAction } from "./schema";
import { cn } from "./_adapter";

function escapeForCssAttribute(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/[\\"]/g, "\\$&");
}

export interface LocalActionsProps {
  surfaceId: string;
  actions: LocalAction[];
  onAction: (actionId: string) => void | Promise<void>;
  onBeforeAction?: (actionId: string) => boolean | Promise<boolean>;
  confirmTimeout?: number;
  align?: "left" | "center" | "right";
  className?: string;
}

export function LocalActions({
  surfaceId,
  actions,
  onAction,
  onBeforeAction,
  confirmTimeout,
  align = "right",
  className,
}: LocalActionsProps) {
  const [hasSurface, setHasSurface] = useState(false);

  useEffect(() => {
    const escapedSurfaceId = escapeForCssAttribute(surfaceId);
    const target = document.querySelector(
      `[data-tool-ui-id="${escapedSurfaceId}"]`,
    );
    setHasSurface(Boolean(target));
  }, [surfaceId]);

  if (!hasSurface) {
    return null;
  }

  return (
    <div
      className={cn("@container/actions flex flex-col gap-2", className)}
      data-slot="local-actions"
      data-tool-ui-surface-id={surfaceId}
    >
      <ActionButtons
        actions={actions}
        onAction={onAction}
        onBeforeAction={onBeforeAction}
        confirmTimeout={confirmTimeout}
        align={align}
      />
    </div>
  );
}
