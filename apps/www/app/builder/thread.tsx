"use client";

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
import { type FC, useState } from "react";
import { MarkdownText } from "@/app/components/assistant-ui/markdown-text";
import { ToolFallback } from "@/app/components/assistant-ui/tool-fallback";
import { TooltipIconButton } from "@/app/components/assistant-ui/tooltip-icon-button";
import { MCPIcon } from "@/app/components/builder/mcp-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui/cn";
import { MCPModal } from "./mcp-modal";

const UserMessage: FC = () => (
  <MessagePrimitive.Root className="mx-auto grid w-full max-w-2xl auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 px-2 py-4 [&:where(>*)]:col-start-2">
    <div className="relative col-start-2 min-w-0">
      <div className="break-words rounded-3xl bg-muted px-5 py-2.5 text-foreground">
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
    <div className="mx-2 break-words text-foreground leading-7">
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
    <ErrorPrimitive.Root className="mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
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
    className="col-start-3 row-start-2 -ml-1 flex gap-1 text-muted-foreground data-floating:absolute data-floating:rounded-md data-floating:border data-floating:bg-background data-floating:p-1 data-floating:shadow-sm"
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
      "mr-2 -ml-2 inline-flex items-center text-muted-foreground text-xs",
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
    <ComposerPrimitive.Root className="ml-auto flex w-full max-w-7/8 flex-col rounded-xl bg-muted">
      <ComposerPrimitive.Input
        className="flex min-h-[60px] w-full resize-none bg-transparent p-4 text-foreground outline-none"
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
      <div className="sticky bottom-0 mx-auto flex w-full max-w-2xl flex-col gap-4 overflow-visible rounded-t-3xl bg-background pb-4 md:pb-6">
        <ComposerPrimitive.Root className="group/input-group relative flex w-full flex-col rounded-2xl border border-border/50 bg-card px-1 pt-2 outline-none transition-[color,box-shadow] has-[textarea:focus-visible]:border-brand/40 has-[textarea:focus-visible]:ring-2 has-[textarea:focus-visible]:ring-brand/15">
          <ComposerPrimitive.Input
            placeholder="Describe the tool UI you want to build..."
            className="mb-1 max-h-32 min-h-16 w-full resize-none bg-transparent px-3.5 pt-1.5 pb-3 text-base outline-none placeholder:text-muted-foreground focus-visible:ring-0"
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
                  className="h-[34px] gap-1.5 rounded-full text-muted-foreground text-xs hover:text-foreground"
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
                    className="size-[34px] rounded-full border border-muted-foreground/60 hover:bg-primary/75 dark:border-muted-foreground/90"
                  >
                    <Square className="size-3.5 fill-white dark:fill-black" />
                  </Button>
                </ComposerPrimitive.Cancel>
              </ThreadPrimitive.If>
            </div>
          </div>
        </ComposerPrimitive.Root>
        <div className="flex items-center justify-center gap-2 text-center text-amber-700 text-xs dark:text-amber-400">
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
  <ThreadPrimitive.Root className="flex h-full w-full flex-col bg-background">
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
