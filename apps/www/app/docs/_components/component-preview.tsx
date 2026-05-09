"use client";

import { useCallback, useState } from "react";
import { ComponentPreviewShell } from "./component-preview-shell";
import { ChatContextPreview } from "./chat-context-preview";
import { PresetSelector } from "./preset-selector";
import { getImportLine } from "@/lib/docs/gallery-usage-code";
import {
  type ComponentId,
  getPreviewConfig,
  type PreviewState,
} from "@/lib/docs/preview-config";
import { usePresetParam } from "@/hooks/use-preset-param";
import { TrackedDynamicCodeBlock } from "./tracked-dynamic-codeblock";

interface ComponentPreviewProps {
  componentId: ComponentId;
}

const EMPTY_STATE: PreviewState = {};

export function ComponentPreview({ componentId }: ComponentPreviewProps) {
  const config = getPreviewConfig(componentId);

  const { currentPreset, setPreset } = usePresetParam({
    presets: config.presets,
    defaultPreset: config.defaultPreset,
  });

  const [state, setState] = useState<PreviewState>(EMPTY_STATE);
  const [prevPreset, setPrevPreset] = useState(currentPreset);

  if (currentPreset !== prevPreset) {
    setPrevPreset(currentPreset);
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

  const preset =
    config.presets[currentPreset] ?? config.presets[config.defaultPreset];
  const body = preset.generateExampleCode(preset.data);
  const code = `${getImportLine(componentId)}\n\n${body}`;

  const previewContent = config.renderComponent({
    data: preset.data,
    presetName: currentPreset,
    state,
    setState: handleSetState,
  });

  const wrappedPreview = config.wrapper ? (
    <config.wrapper>{previewContent}</config.wrapper>
  ) : (
    previewContent
  );

  const chatPanel = (
    <ChatContextPreview
      userMessage={config.chatContext.userMessage}
      preamble={config.chatContext.preamble}
    >
      {wrappedPreview}
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
      preview={wrappedPreview}
      chatPanel={chatPanel}
      codePanel={
        <div className="code-panel-fullbleed scrollbar-subtle">
          <TrackedDynamicCodeBlock
            lang="tsx"
            code={code}
            copyButtonLabel="component example code"
          />
        </div>
      }
      code={code}
    />
  );
}
