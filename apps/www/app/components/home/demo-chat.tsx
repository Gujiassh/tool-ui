"use client";

import { useMemo } from "react";
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  Tools,
  useAui,
} from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { DEMO_CHAT_TOOLKIT } from "@/lib/demo-chat/toolkit";
import {
  AssistantMessage,
  Composer,
  UserMessage,
} from "@/app/playground/chat-ui";

// Prompts designed to trigger specific tools: get_tasks, show_plan, show_stats, show_terminal
const SUGGESTIONS = [
  { text: "Show me the support tickets", tool: "get_tasks" },
  { text: "Create a deployment plan", tool: "show_plan" },
  { text: "How's Q4 looking?", tool: "show_stats" },
  { text: "Run the auth tests", tool: "show_terminal" },
] as const;

const PASTEL_COLORS = [
  "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200/80 dark:bg-pink-950/40 dark:text-pink-200 dark:border-pink-800/50 dark:hover:bg-pink-900/30",
  "bg-violet-100 text-violet-800 border-violet-200 hover:bg-violet-200/80 dark:bg-violet-950/40 dark:text-violet-200 dark:border-violet-800/50 dark:hover:bg-violet-900/30",
  "bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200/80 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800/50 dark:hover:bg-sky-900/30",
  "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/50 dark:hover:bg-emerald-900/30",
] as const;

function SuggestionChip({
  children,
  onClick,
  colorClass,
}: {
  children: string;
  onClick: () => void;
  colorClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border px-6 py-4 text-left text-base font-medium transition-colors ${colorClass}`}
    >
      {children}
    </button>
  );
}

function SuggestionChips() {
  const aui = useAui();
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {SUGGESTIONS.map(({ text, tool }, i) => (
        <SuggestionChip
          key={tool}
          colorClass={PASTEL_COLORS[i]}
          onClick={() => {
            const composer = aui.composer();
            composer.setText(text);
            composer.send();
          }}
        >
          {text}
        </SuggestionChip>
      ))}
    </div>
  );
}

export function DemoChat() {
  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: "/api/chat",
      }),
    [],
  );

  const runtime = useChatRuntime({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const aui = useAui({
    tools: Tools({ toolkit: DEMO_CHAT_TOOLKIT }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <ThreadPrimitive.Root className="flex h-full flex-col overflow-hidden">
        <ThreadPrimitive.Viewport className="scrollbar-subtle bg-muted/30 flex flex-1 flex-col overflow-y-auto px-6 pt-20 pb-6">
          <ThreadPrimitive.If empty>
            <div className="text-muted-foreground mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-6 text-center">
              <p className="text-2xl font-semibold">Try Tool UI</p>
              <p className="text-sm">
                Ask to see a plan, support tickets, metrics, or run a command.
                Each response uses a different Tool UI component.
              </p>
              <SuggestionChips />
            </div>
          </ThreadPrimitive.If>
          <ThreadPrimitive.Messages
            components={{
              UserMessage,
              AssistantMessage,
            }}
          />
        </ThreadPrimitive.Viewport>
        <div className="border-t px-4 pb-4 pt-3">
          <Composer />
        </div>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}
