"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronRight, Loader2, MoreHorizontal, X } from "lucide-react";
import type { PlanProps, PlanTodo, PlanTodoStatus } from "./schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
} from "./_adapter";
import { ActionButtons } from "../shared/action-buttons";
import { normalizeActionsConfig } from "../shared/actions-config";
import { resolveNewAnimationIds } from "../shared/motion-state";
import { calculatePlanProgress, shouldCelebrateProgress } from "./progress";

const INITIAL_VISIBLE_TODO_COUNT = 4;

function TodoIcon({ status }: { status: PlanTodoStatus }) {
  if (status === "pending") {
    return (
      <span
        className="border-border bg-card flex size-6 shrink-0 items-center justify-center rounded-full border motion-safe:transition-all motion-safe:duration-200"
        aria-hidden="true"
      />
    );
  }

  if (status === "in_progress") {
    return (
      <span
        className="border-border bg-card flex size-6 shrink-0 items-center justify-center rounded-full border shadow-[0_0_0_4px_hsl(var(--primary)/0.1)] motion-safe:transition-all motion-safe:duration-300"
        aria-hidden="true"
      >
        <Loader2 className="text-primary size-5 motion-safe:animate-[spin_0.7s_linear_infinite]" />
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span
        className="border-primary bg-primary flex size-6 shrink-0 items-center justify-center rounded-full border shadow-sm"
        aria-hidden="true"
      >
        <Check className="text-primary-foreground size-4" strokeWidth={3} />
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span
        className="border-destructive bg-destructive flex size-6 shrink-0 items-center justify-center rounded-full border shadow-sm dark:border-red-600 dark:bg-red-600"
        aria-hidden="true"
      >
        <X className="size-4 text-white" strokeWidth={3} />
      </span>
    );
  }

  return null;
}

interface PlanTodoItemProps {
  todo: PlanTodo;
  className?: string;
  style?: React.CSSProperties;
  showConnector?: boolean;
}

function PlanTodoItem({
  todo,
  className,
  style,
  showConnector,
}: PlanTodoItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const previousStatus = React.useRef<PlanTodoStatus>(todo.status);
  const shouldAnimateStatus =
    previousStatus.current !== todo.status &&
    (todo.status === "completed" || todo.status === "cancelled");

  useEffect(() => {
    previousStatus.current = todo.status;
  }, [todo.status]);

  const labelElement = (
    <span
      className={cn(
        "text-sm leading-6 font-medium break-words",
        todo.status === "pending" && "text-muted-foreground",
        todo.status === "in_progress" &&
          "motion-safe:shimmer shimmer-invert text-foreground",
        (todo.status === "completed" || todo.status === "cancelled") &&
          "text-muted-foreground",
      )}
    >
      {todo.label}
    </span>
  );

  if (!todo.description) {
    return (
      <li
        className={cn(
          "relative -mx-2 flex cursor-default items-start gap-3 rounded-md px-2 py-1.5",
          className,
        )}
        style={style}
      >
        {showConnector && (
          <div
            className="bg-border absolute top-6 left-5 w-px"
            style={{
              height: "calc(100% + 0.25rem)",
            }}
            aria-hidden="true"
          />
        )}
        <div className="relative z-10">
          <TodoIconWithMountAwareStatusAnimation
            status={todo.status}
            shouldAnimateStatus={shouldAnimateStatus}
          />
        </div>
        <div className="min-w-0 flex-1">{labelElement}</div>
      </li>
    );
  }

  return (
    <li
      className={cn(
        "relative -mx-2 min-w-0 cursor-default rounded-md",
        className,
      )}
      style={style}
    >
      {showConnector && (
        <div
          className="bg-border absolute top-6 left-5 w-px"
          style={{
            height: "calc(100% + 0.25rem)",
          }}
          aria-hidden="true"
        />
      )}
      <Collapsible
        asChild
        open={isOpen}
        onOpenChange={(open) => {
          setHasInteracted(true);
          setIsOpen(open);
        }}
      >
        <div
          className="data-[state=open]:bg-primary/5 min-w-0 rounded-md motion-safe:transition-all motion-safe:duration-200"
          style={{
            backdropFilter: isOpen ? "blur(2px)" : undefined,
          }}
        >
          <CollapsibleTrigger className="group/todo flex w-full cursor-default items-start gap-3 px-2 py-1.5 text-left">
            <div className="relative z-10">
              <TodoIconWithMountAwareStatusAnimation
                status={todo.status}
                shouldAnimateStatus={shouldAnimateStatus}
              />
            </div>
            <span className="min-w-0 flex-1">{labelElement}</span>
            <ChevronRight className="text-muted-foreground/50 group-hover/todo:text-muted-foreground mt-0.5 size-4 shrink-0 rotate-90 group-data-[state=open]/todo:[transform:rotateY(180deg)] motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
          </CollapsibleTrigger>
          <CollapsibleContent
            className={cn(
              "group/content",
              !hasInteracted &&
                "data-[state=open]:[animation:none] data-[state=closed]:[animation:none]",
            )}
            data-slot="collapsible-content"
          >
            <div
              className={cn(
                "min-w-0",
                hasInteracted &&
                  "motion-safe:group-data-[state=closed]/content:animate-[fade-out-stagger_120ms_ease-out] motion-safe:group-data-[state=open]/content:animate-[fade-in-stagger_120ms_ease-out_30ms_backwards]",
              )}
            >
              <p className="text-muted-foreground min-w-0 pr-2 pb-1.5 pl-11 text-sm text-pretty break-words">
                {todo.description}
              </p>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </li>
  );
}

interface TodoListProps {
  todos: PlanTodo[];
  newTodoIds: Set<string>;
}

function TodoList({ todos, newTodoIds }: TodoListProps) {
  return (
    <>
      {todos.map((todo, index) => {
        const isNew = newTodoIds.has(todo.id);
        const staggerDelay = isNew ? index * 50 : 0;

        return (
          <PlanTodoItem
            key={todo.id}
            todo={todo}
            showConnector={index < todos.length - 1}
            className={cn(
              isNew && "motion-safe:animate-[fade-up_300ms_ease-out]",
            )}
            style={
              isNew
                ? {
                    animationDelay: `${staggerDelay}ms`,
                    animationFillMode: "backwards",
                  }
                : undefined
            }
          />
        );
      })}
    </>
  );
}

interface ProgressBarProps {
  progress: number;
  isCelebrating: boolean;
}

function ProgressBar({ progress, isCelebrating }: ProgressBarProps) {
  return (
    <div className="bg-muted relative mb-3 h-1.5 overflow-hidden rounded-full">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          progress === 100
            ? cn(
                "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400",
                isCelebrating && "motion-safe:animate-[progress-pulse_600ms_ease-out]",
              )
            : "bg-primary",
        )}
        style={{
          width: `${progress}%`,
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
        }}
      />
      {isCelebrating && (
        <div
          className="pointer-events-none absolute inset-0 rounded-full motion-safe:animate-[glow-pulse_600ms_ease-out]"
          style={{
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)",
          }}
        />
      )}
    </div>
  );
}

function TodoIconWithMountAwareStatusAnimation({
  status,
  shouldAnimateStatus,
}: {
  status: PlanTodoStatus;
  shouldAnimateStatus: boolean;
}) {
  if (status === "completed") {
    return (
      <span
        className={cn(
          "border-primary bg-primary flex size-6 shrink-0 items-center justify-center rounded-full border shadow-sm",
          shouldAnimateStatus &&
            "motion-safe:animate-[spring-bounce_500ms_cubic-bezier(0.34,1.56,0.64,1)]",
        )}
        aria-hidden="true"
      >
        <Check
          className={cn(
            "text-primary-foreground size-4",
            shouldAnimateStatus &&
              "[&_path]:motion-safe:animate-[check-draw_400ms_cubic-bezier(0.34,1.56,0.64,1)_100ms_backwards]",
          )}
          strokeWidth={3}
          style={{ ["--check-path-length" as string]: "24" }}
        />
      </span>
    );
  }

  if (status === "cancelled") {
    return (
      <span
        className={cn(
          "border-destructive bg-destructive flex size-6 shrink-0 items-center justify-center rounded-full border shadow-sm dark:border-red-600 dark:bg-red-600",
          shouldAnimateStatus &&
            "motion-safe:animate-[spring-bounce_500ms_cubic-bezier(0.34,1.56,0.64,1)]",
        )}
        aria-hidden="true"
      >
        <X
          className={cn(
            "size-4 text-white",
            shouldAnimateStatus &&
              "[&_path]:motion-safe:animate-[check-draw_400ms_cubic-bezier(0.34,1.56,0.64,1)_100ms_backwards]",
          )}
          strokeWidth={3}
          style={{ ["--check-path-length" as string]: "16" }}
        />
      </span>
    );
  }

  return <TodoIcon status={status} />;
}

function PlanRoot({
  id,
  title,
  description,
  todos,
  maxVisibleTodos = INITIAL_VISIBLE_TODO_COUNT,
  responseActions,
  onResponseAction,
  onBeforeResponseAction,
  className,
  showProgress = true,
}: PlanProps & { showProgress?: boolean }) {
  const seenTodoIds = useRef(new Set<string>());
  const [newTodoIds, setNewTodoIds] = useState<Set<string>>(new Set());
  const [hasInteractedWithMore, setHasInteractedWithMore] = useState(false);
  const isInitialMount = useRef(true);
  const isInitialProgressState = useRef(true);
  const prevProgressRef = useRef(0);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const { visibleTodos, hiddenTodos, completedCount, allComplete, progress } =
    useMemo(() => {
      const completed = todos.filter((t) => t.status === "completed").length;
      return {
        visibleTodos: todos.slice(0, maxVisibleTodos),
        hiddenTodos: todos.slice(maxVisibleTodos),
        completedCount: completed,
        allComplete: completed === todos.length,
        progress: calculatePlanProgress({
          completedCount: completed,
          totalCount: todos.length,
        }),
      };
    }, [todos, maxVisibleTodos]);

  useEffect(() => {
    const { newIds, nextSeenIds } = resolveNewAnimationIds({
      seenIds: seenTodoIds.current,
      currentIds: todos.map((todo) => todo.id),
      treatAsInitialSnapshot: isInitialMount.current,
    });

    seenTodoIds.current = nextSeenIds;
    isInitialMount.current = false;

    if (newIds.size === 0) {
      setNewTodoIds(new Set());
      return;
    }

    setNewTodoIds(newIds);

    const timer = setTimeout(() => {
      setNewTodoIds(new Set());
    }, 500);

    return () => clearTimeout(timer);
  }, [todos]);

  useEffect(() => {
    if (isInitialProgressState.current) {
      isInitialProgressState.current = false;
      prevProgressRef.current = progress;
      return;
    }

    const shouldCelebrate = shouldCelebrateProgress({
      previous: prevProgressRef.current,
      next: progress,
    });
    prevProgressRef.current = progress;

    if (shouldCelebrate) {
      setIsCelebrating(true);
      const timer = setTimeout(() => setIsCelebrating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const resolvedFooterActions = useMemo(
    () => normalizeActionsConfig(responseActions),
    [responseActions],
  );

  return (
    <Card
      className={cn("w-full max-w-xl min-w-80 gap-4 py-4", className)}
      data-tool-ui-id={id}
      data-slot="plan"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle className="leading-5 font-medium text-pretty">
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {allComplete && (
          <Check className="mt-0.5 size-5 shrink-0 text-emerald-500" />
        )}
      </CardHeader>

      <CardContent className="min-w-0 px-4">
        <div className="bg-muted/70 min-w-0 rounded-lg px-6 py-4">
          {showProgress && (
            <>
              <div className="text-muted-foreground mb-2 text-sm">
                {completedCount} of {todos.length} complete
              </div>

              <ProgressBar progress={progress} isCelebrating={isCelebrating} />
            </>
          )}

          <ul className="mt-4 min-w-0 space-y-1">
            <TodoList todos={visibleTodos} newTodoIds={newTodoIds} />

            {hiddenTodos.length > 0 && (
              <li className="mt-1">
                <Accordion
                  type="single"
                  collapsible
                  onValueChange={() => setHasInteractedWithMore(true)}
                >
                  <AccordionItem value="more" className="border-0">
                    <AccordionTrigger className="text-muted-foreground hover:text-primary flex cursor-default items-start justify-start gap-2 py-1 text-sm font-normal [&>svg:last-child]:hidden">
                      <MoreHorizontal className="text-muted-foreground/70 mt-0.5 size-4 shrink-0" />
                      <span>{hiddenTodos.length} more</span>
                    </AccordionTrigger>
                    <AccordionContent
                      className={cn(
                        "pt-2 pb-0",
                        !hasInteractedWithMore &&
                          "data-[state=open]:[animation:none] data-[state=closed]:[animation:none] group-data-[state=open]:animate-none group-data-[state=closed]:animate-none",
                      )}
                    >
                      <ul className="-mx-2 space-y-2 px-2">
                        <TodoList todos={hiddenTodos} newTodoIds={newTodoIds} />
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </li>
            )}
          </ul>
        </div>
      </CardContent>

      {resolvedFooterActions && (
        <CardFooter className="@container/actions">
          <ActionButtons
            actions={resolvedFooterActions.items}
            align={resolvedFooterActions.align}
            confirmTimeout={resolvedFooterActions.confirmTimeout}
            onAction={(actionId) => onResponseAction?.(actionId)}
            onBeforeAction={onBeforeResponseAction}
            className="w-full"
          />
        </CardFooter>
      )}
    </Card>
  );
}

export function PlanCompact(props: PlanProps) {
  return <PlanRoot {...props} showProgress={false} />;
}

type PlanComponent = typeof PlanRoot & {
  Compact: typeof PlanCompact;
};

export const Plan = Object.assign(PlanRoot, {
  Compact: PlanCompact,
}) as PlanComponent;
