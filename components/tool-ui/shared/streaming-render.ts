import type { ToolCallMessagePartStatus } from "@assistant-ui/react";

export type SafeParser<T> = (input: unknown) => T | null;

export type StreamingToolRenderState<TArgs, TResult> =
  | {
      kind: "loading";
      args: TArgs | null;
      result: null;
      message: string;
      status: ToolCallMessagePartStatus;
    }
  | {
      kind: "partial";
      args: TArgs | null;
      result: TResult;
      status: ToolCallMessagePartStatus;
    }
  | {
      kind: "ready";
      args: TArgs | null;
      result: TResult;
      status: ToolCallMessagePartStatus;
    }
  | {
      kind: "error";
      args: TArgs | null;
      result: null;
      message: string;
      isCancelled: boolean;
      status: ToolCallMessagePartStatus;
    };

export interface ResolveStreamingToolRenderStateOptions<TArgs, TResult> {
  status: ToolCallMessagePartStatus;
  args?: unknown;
  result?: unknown;
  safeParseArgs?: SafeParser<TArgs>;
  safeParseResult?: SafeParser<TResult>;
  loadingMessage?: string;
  awaitingActionMessage?: string;
  unavailableMessage?: string;
  cancelledMessage?: string;
  errorMessage?: string;
}

const DEFAULT_LOADING_MESSAGE = "Loading…";
const DEFAULT_AWAITING_ACTION_MESSAGE = "Awaiting input…";
const DEFAULT_UNAVAILABLE_MESSAGE = "Tool output unavailable";
const DEFAULT_CANCELLED_MESSAGE = "Tool call cancelled";
const DEFAULT_ERROR_MESSAGE = "Tool failed";

function stringifyError(error: unknown): string | null {
  if (typeof error === "string") return error;
  if (error == null) return null;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

/**
 * Normalize streamed tool-part args/result into a UI-safe render state.
 *
 * - Use safe parsers so partial payloads don't throw while streaming.
 * - Distinguishes loading/partial/ready/error phases for consistent fallback UI.
 */
export function resolveStreamingToolRenderState<TArgs, TResult>(
  options: ResolveStreamingToolRenderStateOptions<TArgs, TResult>,
): StreamingToolRenderState<TArgs, TResult> {
  const {
    status,
    args,
    result,
    safeParseArgs,
    safeParseResult,
    loadingMessage = DEFAULT_LOADING_MESSAGE,
    awaitingActionMessage = DEFAULT_AWAITING_ACTION_MESSAGE,
    unavailableMessage = DEFAULT_UNAVAILABLE_MESSAGE,
    cancelledMessage = DEFAULT_CANCELLED_MESSAGE,
    errorMessage = DEFAULT_ERROR_MESSAGE,
  } = options;

  const parsedArgs =
    args === undefined
      ? null
      : safeParseArgs
        ? safeParseArgs(args)
        : (args as TArgs);

  const parsedResult =
    result === undefined
      ? null
      : safeParseResult
        ? safeParseResult(result)
        : (result as TResult);

  if (status.type === "incomplete") {
    const isCancelled = status.reason === "cancelled";
    const baseMessage = isCancelled ? cancelledMessage : errorMessage;
    const statusError = stringifyError(status.error);

    return {
      kind: "error",
      args: parsedArgs,
      result: null,
      message: statusError ? `${baseMessage}: ${statusError}` : baseMessage,
      isCancelled,
      status,
    };
  }

  if (parsedResult !== null) {
    if (status.type === "running" || status.type === "requires-action") {
      return {
        kind: "partial",
        args: parsedArgs,
        result: parsedResult,
        status,
      };
    }

    return {
      kind: "ready",
      args: parsedArgs,
      result: parsedResult,
      status,
    };
  }

  if (status.type === "running") {
    return {
      kind: "loading",
      args: parsedArgs,
      result: null,
      message: loadingMessage,
      status,
    };
  }

  if (status.type === "requires-action") {
    return {
      kind: "loading",
      args: parsedArgs,
      result: null,
      message: awaitingActionMessage,
      status,
    };
  }

  return {
    kind: "error",
    args: parsedArgs,
    result: null,
    message: unavailableMessage,
    isCancelled: false,
    status,
  };
}
