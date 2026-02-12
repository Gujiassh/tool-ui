"use client";

import { ActionButtons } from "./action-buttons";
import type { LocalAction } from "./schema";
import { cn } from "./_adapter";

export interface LocalActionsProps {
  id: string;
  title?: string;
  actions: LocalAction[];
  onAction: (actionId: string) => void | Promise<void>;
  onBeforeAction?: (actionId: string) => boolean | Promise<boolean>;
  confirmTimeout?: number;
  align?: "left" | "center" | "right";
  className?: string;
}

export function LocalActions({
  id,
  title,
  actions,
  onAction,
  onBeforeAction,
  confirmTimeout,
  align = "right",
  className,
}: LocalActionsProps) {
  return (
    <section
      className={cn("@container/actions flex flex-col gap-2", className)}
      data-slot="local-actions"
      data-tool-ui-id={id}
      aria-label={title}
    >
      {title ? (
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
      ) : null}
      <ActionButtons
        actions={actions}
        onAction={onAction}
        onBeforeAction={onBeforeAction}
        confirmTimeout={confirmTimeout}
        align={align}
      />
    </section>
  );
}
