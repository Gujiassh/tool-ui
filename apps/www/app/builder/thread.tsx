"use client";

import { useState, type FC } from "react";
import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import {
  ArrowUpIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ConstructionIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/app/components/assistant-ui/markdown-text";
import { ToolFallback } from "@/app/components/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/app/components/assistant-ui/tooltip-icon-button";
import { MCPIcon } from "@/app/components/builder/mcp-icon";
import { cn } from "@/lib/ui/cn";
import { MCPModal } from "./mcp-modal";

const UserMessage: FC = () => (
  <MessagePrimitive.Root className="mx-auto grid w-full max-w-2xl auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 px-2 py-4 [&:where(>*)]:col-start-2">
    <div className="relative col-start-2 min-w-0">
      <div className="bg-muted text-foreground rounded-3xl px-5 py-2.5 break-words">
        <MessagePrimitive.Content components={{ Text: MarkdownText }} />
      </div>
      <div className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 pr-2">
        <UserActionBar />
      </div>
    </div>
    <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
  </MessagePrimitive.Root>
);

const AssistantMessage: FC = () => (
  <MessagePrimitive.Root className="relative mx-auto w-full max-w-2xl py-4">
    <div className="text-foreground mx-2 leading-7 break-words">
      <MessagePrimitive.Content
        components={{ Text: MarkdownText, tools: { Fallback: ToolFallback } }}
      />
      <MessageError />
    </div>
    <div className="mt-2 ml-2 flex">
      <BranchPicker />
      <AssistantActionBar />
    </div>
  </MessagePrimitive.Root>
);

const MessageError: FC = () => (
  <MessagePrimitive.Error>
    <ErrorPrimitive.Root className="border-destructive bg-destructive/10 text-destructive dark:bg-destructive/5 mt-2 rounded-md border p-3 text-sm dark:text-red-200">
      <ErrorPrimitive.Message className="line-clamp-2" />
    </ErrorPrimitive.Root>
  </MessagePrimitive.Error>
);

const UserActionBar: FC = () => (
  <ActionBarPrimitive.Root
    hideWhenRunning
    autohide="not-last"
    className="flex flex-col items-end"
  >
    <ActionBarPrimitive.Edit asChild>
      <TooltipIconButton tooltip="Edit" className="p-4">
        <PencilIcon />
      </TooltipIconButton>
    </ActionBarPrimitive.Edit>
  </ActionBarPrimitive.Root>
);

const AssistantActionBar: FC = () => (
  <ActionBarPrimitive.Root
    hideWhenRunning
    autohide="not-last"
    autohideFloat="single-branch"
    className="text-muted-foreground data-floating:bg-background col-start-3 row-start-2 -ml-1 flex gap-1 data-floating:absolute data-floating:rounded-md data-floating:border data-floating:p-1 data-floating:shadow-sm"
  >
    <ActionBarPrimitive.Copy asChild>
      <TooltipIconButton tooltip="Copy">
        <MessagePrimitive.If copied>
          <CheckIcon />
        </MessagePrimitive.If>
        <MessagePrimitive.If copied={false}>
          <CopyIcon />
        </MessagePrimitive.If>
      </TooltipIconButton>
    </ActionBarPrimitive.Copy>
    <ActionBarPrimitive.Reload asChild>
      <TooltipIconButton tooltip="Refresh">
        <RefreshCwIcon />
      </TooltipIconButton>
    </ActionBarPrimitive.Reload>
  </ActionBarPrimitive.Root>
);

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => (
  <BranchPickerPrimitive.Root
    hideWhenSingleBranch
    className={cn(
      "text-muted-foreground mr-2 -ml-2 inline-flex items-center text-xs",
      className,
    )}
    {...rest}
  >
    <BranchPickerPrimitive.Previous asChild>
      <TooltipIconButton tooltip="Previous">
        <ChevronLeftIcon />
      </TooltipIconButton>
    </BranchPickerPrimitive.Previous>
    <span className="font-medium">
      <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
    </span>
    <BranchPickerPrimitive.Next asChild>
      <TooltipIconButton tooltip="Next">
        <ChevronRightIcon />
      </TooltipIconButton>
    </BranchPickerPrimitive.Next>
  </BranchPickerPrimitive.Root>
);

const EditComposer: FC = () => (
  <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-2 first:mt-4">
    <ComposerPrimitive.Root className="bg-muted ml-auto flex w-full max-w-7/8 flex-col rounded-xl">
      <ComposerPrimitive.Input
        className="text-foreground flex min-h-[60px] w-full resize-none bg-transparent p-4 outline-none"
        autoFocus
      />
      <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
        <ComposerPrimitive.Cancel asChild>
          <Button variant="ghost" size="sm" aria-label="Cancel edit">
            Cancel
          </Button>
        </ComposerPrimitive.Cancel>
        <ComposerPrimitive.Send asChild>
          <Button size="sm" aria-label="Update message">
            Update
          </Button>
        </ComposerPrimitive.Send>
      </div>
    </ComposerPrimitive.Root>
  </div>
);

const Composer: FC = () => {
  const [mcpModalOpen, setMcpModalOpen] = useState(false);
  const isNewThread = useAuiState(
    ({ threadListItem }) => threadListItem.status === "new",
  );

  return (
    <>
      <MCPModal open={mcpModalOpen} onOpenChange={setMcpModalOpen} />
      <div className="bg-background sticky bottom-0 mx-auto flex w-full max-w-2xl flex-col gap-4 overflow-visible rounded-t-3xl pb-4 md:pb-6">
        <ComposerPrimitive.Root className="group/input-group bg-card has-[textarea:focus-visible]:border-brand/40 has-[textarea:focus-visible]:ring-brand/15 relative flex w-full flex-col rounded-2xl border border-border/50 px-1 pt-2 transition-[color,box-shadow] outline-none has-[textarea:focus-visible]:ring-2">
          <ComposerPrimitive.Input
            placeholder="Describe the tool UI you want to build..."
            className="placeholder:text-muted-foreground mb-1 max-h-32 min-h-16 w-full resize-none bg-transparent px-3.5 pt-1.5 pb-3 text-base outline-none focus-visible:ring-0"
            rows={1}
            autoFocus
          />
          <div className="relative mx-1 mt-2 mb-2 flex items-center justify-between">
            <div>
              {isNewThread && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-[34px] gap-1.5 rounded-full text-xs"
                  onClick={() => setMcpModalOpen(true)}
                >
                  <MCPIcon className="size-3.5" />
                  <span>MCP</span>
                </Button>
              )}
            </div>
            <div className="flex items-center justify-end">
              <ThreadPrimitive.If running={false}>
                <ComposerPrimitive.Send asChild>
                  <Button
                    type="submit"
                    variant="default"
                    size="icon"
                    className="size-[34px] rounded-full p-1"
                  >
                    <ArrowUpIcon className="size-5" />
                  </Button>
                </ComposerPrimitive.Send>
              </ThreadPrimitive.If>
              <ThreadPrimitive.If running>
                <ComposerPrimitive.Cancel asChild>
                  <Button
                    type="button"
                    variant="default"
                    size="icon"
                    className="border-muted-foreground/60 hover:bg-primary/75 dark:border-muted-foreground/90 size-[34px] rounded-full border"
                  >
                    <Square className="size-3.5 fill-white dark:fill-black" />
                  </Button>
                </ComposerPrimitive.Cancel>
              </ThreadPrimitive.If>
            </div>
          </div>
        </ComposerPrimitive.Root>
        <div className="flex items-center justify-center gap-2 text-center text-xs text-amber-700 dark:text-amber-400">
          <ConstructionIcon className="size-3.5 shrink-0" />
          <span>
            This builder is under heavy construction and may not always work as
            expected.
          </span>
        </div>
      </div>
    </>
  );
};

export const Thread: FC = () => (
  <ThreadPrimitive.Root className="bg-background flex h-full w-full flex-col">
    <ThreadPrimitive.Viewport className="relative flex flex-1 flex-col overflow-y-auto px-4">
      <ThreadPrimitive.If empty>
        <div className="flex flex-1 items-center justify-center">
          <Composer />
        </div>
      </ThreadPrimitive.If>
      <ThreadPrimitive.If empty={false}>
        <ThreadPrimitive.Messages
          components={{ UserMessage, EditComposer, AssistantMessage }}
        />
        <div className="min-h-8 grow" />
        <Composer />
      </ThreadPrimitive.If>
    </ThreadPrimitive.Viewport>
  </ThreadPrimitive.Root>
);
