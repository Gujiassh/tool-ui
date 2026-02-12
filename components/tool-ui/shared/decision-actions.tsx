"use client";

import { useCallback, useEffect, useState } from "react";
import { ActionButtons } from "./action-buttons";
import {
  DecisionResultSchema,
  type DecisionAction,
  type DecisionResult,
} from "./schema";
import { cn } from "./_adapter";

function escapeForCssAttribute(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }

  return value.replace(/[\\"]/g, "\\$&");
}

export interface DecisionActionsProps<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> {
  surfaceId: string;
  actions: DecisionAction[];
  onAction: (
    action: { id: string; label: string },
  ) => DecisionResult<TPayload> | Promise<DecisionResult<TPayload>>;
  onCommit: (
    result: DecisionResult<TPayload>,
  ) => void | Promise<void>;
  onBeforeAction?: (actionId: string) => boolean | Promise<boolean>;
  confirmTimeout?: number;
  align?: "left" | "center" | "right";
  className?: string;
}

export function DecisionActions<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>({
  surfaceId,
  actions,
  onAction,
  onCommit,
  onBeforeAction,
  confirmTimeout,
  align = "right",
  className,
}: DecisionActionsProps<TPayload>) {
  const [hasSurface, setHasSurface] = useState(false);

  useEffect(() => {
    const escapedSurfaceId = escapeForCssAttribute(surfaceId);
    const target = document.querySelector(
      `[data-tool-ui-id="${escapedSurfaceId}"]`,
    );
    setHasSurface(Boolean(target));
  }, [surfaceId]);

  const handleAction = useCallback(
    async (actionId: string) => {
      const action = actions.find((item) => item.id === actionId);
      if (!action) return;

      const result = await onAction({ id: action.id, label: action.label });
      const parsed = DecisionResultSchema.safeParse(result);

      if (!parsed.success) {
        throw new Error(
          `DecisionActions expected a valid DecisionResult envelope for action "${action.id}".`,
        );
      }

      await onCommit(parsed.data as DecisionResult<TPayload>);
    },
    [actions, onAction, onCommit],
  );

  if (!hasSurface) {
    return null;
  }

  return (
    <div
      className={cn("@container/actions flex flex-col gap-2", className)}
      data-slot="decision-actions"
      data-tool-ui-surface-id={surfaceId}
    >
      <ActionButtons
        actions={actions}
        onAction={handleAction}
        onBeforeAction={onBeforeAction}
        confirmTimeout={confirmTimeout}
        align={align}
      />
    </div>
  );
}
