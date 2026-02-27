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
        <ThreadPrimitive.Viewport className="scrollbar-subtle flex flex-1 flex-col overflow-y-auto px-6 pt-20 pb-6">
          <ThreadPrimitive.If empty>
            <div className="text-muted-foreground mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 text-center">
              <p className="text-base font-medium">Try the Tool UI demo</p>
              <p className="text-sm">
                Ask to see a plan, support tickets, metrics, or run a command.
                Each response uses a different Tool UI component.
              </p>
              <div className="text-muted-foreground flex flex-wrap justify-center gap-2 text-xs">
                <SuggestionChip>Show me the support tickets</SuggestionChip>
                <SuggestionChip>Create a deployment plan</SuggestionChip>
                <SuggestionChip>How's Q4 looking?</SuggestionChip>
                <SuggestionChip>Run the auth tests</SuggestionChip>
              </div>
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

function SuggestionChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-muted/50 rounded-full border px-3 py-1.5 text-left">
      {children}
    </span>
  );
}
