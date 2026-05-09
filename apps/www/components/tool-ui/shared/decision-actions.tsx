"use client";

import { useCallback } from "react";
import { cn } from "./_adapter";
import { ActionButtons } from "./action-buttons";
import {
  createDecisionResult,
  type DecisionAction,
  type DecisionResult,
  DecisionResultSchema,
} from "./schema";
import { useOptionalToolUI } from "./tool-ui-context";

export interface DecisionActionsProps<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Stable identifier for the decision surface. Defaults to `id` from <ToolUI> context. */
  id?: string;
  /**
   * Stable decision identifier used to deduplicate the decision envelope across
   * retries / re-renders. Pass any string unique to the surface.
   */
  decisionId: string;
  actions: DecisionAction[];
  /**
   * Returns an optional payload for the decision. The library wraps it in a
   * typed `DecisionResult` envelope before invoking `onCommit` — callers cannot
   * forget required envelope fields.
   */
  onAction: (action: {
    id: string;
    label: string;
  }) =>
    | TPayload
    | undefined
    | undefined
    | Promise<TPayload | undefined | undefined>;
  onCommit: (result: DecisionResult<TPayload>) => void | Promise<void>;
  onBeforeAction?: (actionId: string) => boolean | Promise<boolean>;
  confirmTimeout?: number;
  align?: "left" | "center" | "right";
  ariaLabel?: string;
  className?: string;
}

export function DecisionActions<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
>({
  id: explicitId,
  decisionId,
  actions,
  onAction,
  onCommit,
  onBeforeAction,
  confirmTimeout,
  align = "right",
  ariaLabel,
  className,
}: DecisionActionsProps<TPayload>) {
  const context = useOptionalToolUI();
  const id = context?.id ?? explicitId;

  if (!id) {
    throw new Error(
      "DecisionActions requires a ToolUI provider or an explicit id prop.",
    );
  }

  const handleAction = useCallback(
    async (actionId: string) => {
      const action = actions.find((item) => item.id === actionId);
      if (!action) return;

      const payload = await onAction({ id: action.id, label: action.label });

      const envelope = createDecisionResult<TPayload>({
        decisionId,
        action: { id: action.id, label: action.label },
        payload: payload ?? undefined,
      });

      const parsed = DecisionResultSchema.safeParse(envelope);
      if (!parsed.success) {
        throw new Error(
          `DecisionActions built an invalid DecisionResult envelope for action "${action.id}".`,
        );
      }

      await onCommit(envelope);
    },
    [actions, decisionId, onAction, onCommit],
  );

  return (
    <div
      className={cn("@container/actions flex flex-col gap-2", className)}
      data-slot="decision-actions"
      data-tool-ui-id={id}
      aria-label={ariaLabel ?? "Decision actions"}
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
