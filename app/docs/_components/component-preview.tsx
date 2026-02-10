"use client";

import { useCallback, useRef, useState } from "react";
import { ComponentPreviewShell } from "./component-preview-shell";
import { ChatContextPreview } from "./chat-context-preview";
import { PresetSelector } from "./preset-selector";
import {
  type ComponentId,
  getPreviewConfig,
  STREAMING_PRESET_NAME,
  type PreviewState,
} from "@/lib/docs/preview-config";
import { usePresetParam } from "@/hooks/use-preset-param";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import {
  ToolRenderState,
  type StreamingToolRenderState,
} from "@/components/tool-ui/shared";

interface ComponentPreviewProps {
  componentId: ComponentId;
}

const EMPTY_STATE: PreviewState = {};
const STREAMING_LOADING_STATE: StreamingToolRenderState<unknown, unknown> = {
  kind: "loading",
  args: null,
  result: null,
  message: "Loading tool output…",
  status: { type: "running" },
};
const STREAMING_PARTIAL_STATE: StreamingToolRenderState<unknown, unknown> = {
  kind: "partial",
  args: null,
  result: {},
  status: { type: "running" },
};
const STREAMING_ERROR_STATE: StreamingToolRenderState<unknown, unknown> = {
  kind: "error",
  args: null,
  result: null,
  message: "Tool output unavailable",
  isCancelled: false,
  status: { type: "complete" },
};

export function ComponentPreview({ componentId }: ComponentPreviewProps) {
  const config = getPreviewConfig(componentId);

  const { currentPreset, setPreset } = usePresetParam({
    presets: config.presets,
    defaultPreset: config.defaultPreset,
  });

  const [state, setState] = useState<PreviewState>(EMPTY_STATE);
  const prevPresetRef = useRef(currentPreset);

  if (prevPresetRef.current !== currentPreset) {
    prevPresetRef.current = currentPreset;
    setState(EMPTY_STATE);
  }

  const handleSelectPreset = useCallback(
    (preset: unknown) => {
      setPreset(preset as string);
      setState(EMPTY_STATE);
    },
    [setPreset],
  );

  const handleSetState = useCallback((newState: Partial<PreviewState>) => {
    setState((prev) => ({ ...prev, ...newState }));
  }, []);

  const isStreamingPreset = currentPreset === STREAMING_PRESET_NAME;
  const previewPresetName = isStreamingPreset ? config.defaultPreset : currentPreset;
  const preset = config.presets[previewPresetName] ?? config.presets[config.defaultPreset];
  const selectedPreset = config.presets[currentPreset] ?? preset;
  const code = selectedPreset.generateExampleCode(selectedPreset.data);

  const previewContent = config.renderComponent({
    data: preset.data,
    presetName: previewPresetName,
    state,
    setState: handleSetState,
  });

  const wrappedPreview = config.wrapper ? (
    <config.wrapper>{previewContent}</config.wrapper>
  ) : (
    previewContent
  );

  const displayPreview = isStreamingPreset ? (
    <div className="flex w-full flex-col gap-4">
      <ToolRenderState state={STREAMING_LOADING_STATE} />
      <div className="flex w-full flex-col gap-3">
        <ToolRenderState
          state={STREAMING_PARTIAL_STATE}
          partialLabel="Streaming partial output"
        />
        {wrappedPreview}
      </div>
      <ToolRenderState state={STREAMING_ERROR_STATE} />
    </div>
  ) : (
    wrappedPreview
  );

  const chatPanel = (
    <ChatContextPreview
      userMessage={config.chatContext.userMessage}
      preamble={config.chatContext.preamble}
    >
      {displayPreview}
    </ChatContextPreview>
  );

  return (
    <ComponentPreviewShell
      componentId={componentId}
      sidebar={
        <PresetSelector
          componentId={componentId}
          currentPreset={currentPreset}
          onSelectPreset={handleSelectPreset}
        />
      }
      preview={displayPreview}
      chatPanel={chatPanel}
      codePanel={
        <div className="code-panel-fullbleed scrollbar-subtle">
          <DynamicCodeBlock lang="tsx" code={code} />
        </div>
      }
      code={code}
    />
  );
}
