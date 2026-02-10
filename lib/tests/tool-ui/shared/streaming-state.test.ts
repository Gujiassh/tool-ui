import { Fragment, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  LinkPreview,
  safeParseSerializableLinkPreview,
} from "@/components/tool-ui/link-preview";
import {
  OptionList,
  safeParseSerializableOptionList,
  type OptionListSelection,
  type SerializableOptionList,
} from "@/components/tool-ui/option-list";
import { linkPreviewPresets } from "@/lib/presets/link-preview";
import { optionListPresets } from "@/lib/presets/option-list";

import {
  resolveStreamingToolRenderState,
  type StreamingToolRenderState,
} from "@/components/tool-ui/shared/streaming-render";
import { ToolRenderState } from "@/components/tool-ui/shared/streaming-state";

const RUNNING_STATUS = { type: "running" } as const;
const REQUIRES_ACTION_STATUS = {
  type: "requires-action",
  reason: "interrupt",
} as const;
const COMPLETE_STATUS = { type: "complete" } as const;
const INCOMPLETE_STATUS = { type: "incomplete", reason: "error" } as const;

function renderLinkPreviewTool({
  status,
  result,
}: {
  status:
    | typeof RUNNING_STATUS
    | typeof COMPLETE_STATUS
    | typeof INCOMPLETE_STATUS;
  result: unknown;
}) {
  const state = resolveStreamingToolRenderState({
    status,
    result,
    safeParseResult: safeParseSerializableLinkPreview,
    loadingMessage: "Loading preview...",
    unavailableMessage: "Preview unavailable",
  });

  return renderToStaticMarkup(
    createElement(
      Fragment,
      null,
      createElement(ToolRenderState, {
        state,
        partialLabel: "Preview is streaming",
      }),
      state.kind === "partial" || state.kind === "ready"
        ? createElement(LinkPreview, { ...state.result })
        : null,
    ),
  );
}

function renderOptionListTool({
  status,
  args,
  result,
}: {
  status:
    | typeof RUNNING_STATUS
    | typeof REQUIRES_ACTION_STATUS
    | typeof COMPLETE_STATUS;
  args: unknown;
  result: unknown;
}) {
  const state = resolveStreamingToolRenderState<
    SerializableOptionList,
    OptionListSelection
  >({
    status,
    args,
    result,
    safeParseArgs: safeParseSerializableOptionList,
    loadingMessage: "Loading options...",
    awaitingActionMessage: "Choose an option",
    unavailableMessage: "Options unavailable",
  });

  if (!state.args) {
    return renderToStaticMarkup(createElement(ToolRenderState, { state }));
  }

  return renderToStaticMarkup(
    createElement(
      Fragment,
      null,
      createElement(ToolRenderState, {
        state,
        partialLabel: "Selection is streaming",
      }),
      state.kind === "partial" || state.kind === "ready"
        ? createElement(OptionList, {
            ...state.args,
            value: undefined,
            choice: state.result,
          })
        : createElement(OptionList, {
            ...state.args,
            value: undefined,
          }),
    ),
  );
}

describe("ToolRenderState", () => {
  it("renders loading and error placeholders as full status cards", () => {
    const loadingState = resolveStreamingToolRenderState({
      status: RUNNING_STATUS,
      result: {},
      safeParseResult: safeParseSerializableLinkPreview,
      loadingMessage: "Loading preview...",
    });

    const errorState = resolveStreamingToolRenderState({
      status: INCOMPLETE_STATUS,
      result: {},
      safeParseResult: safeParseSerializableLinkPreview,
      errorMessage: "Preview failed",
    });

    const loadingMarkup = renderToStaticMarkup(
      createElement(ToolRenderState, { state: loadingState }),
    );
    const errorMarkup = renderToStaticMarkup(
      createElement(ToolRenderState, { state: errorState }),
    );

    expect(loadingMarkup).toContain("data-tool-ui-streaming-state=\"loading\"");
    expect(loadingMarkup).toContain("Loading preview...");
    expect(errorMarkup).toContain("data-tool-ui-streaming-state=\"error\"");
    expect(errorMarkup).toContain("Preview failed");
  });

  it("renders partial as compact status and ready as no-op", () => {
    const partialState = resolveStreamingToolRenderState({
      status: RUNNING_STATUS,
      result: linkPreviewPresets.basic.data.linkPreview,
      safeParseResult: safeParseSerializableLinkPreview,
    });

    const readyState = resolveStreamingToolRenderState({
      status: COMPLETE_STATUS,
      result: linkPreviewPresets.basic.data.linkPreview,
      safeParseResult: safeParseSerializableLinkPreview,
    });

    const partialMarkup = renderToStaticMarkup(
      createElement(ToolRenderState, {
        state: partialState,
        partialLabel: "Streaming update",
      }),
    );
    const readyMarkup = renderToStaticMarkup(
      createElement(ToolRenderState, { state: readyState }),
    );

    expect(partialMarkup).toContain("Streaming update");
    expect(partialMarkup).toContain("data-tool-ui-streaming-state=\"partial\"");
    expect(readyMarkup).toBe("");
  });

  it("treats error kind as failed even when status is complete", () => {
    const inconsistentErrorState: StreamingToolRenderState<unknown, unknown> = {
      kind: "error",
      args: null,
      result: null,
      message: "Tool output unavailable",
      isCancelled: false,
      status: { type: "complete" },
    };

    const errorMarkup = renderToStaticMarkup(
      createElement(ToolRenderState, { state: inconsistentErrorState }),
    );

    expect(errorMarkup).toContain("Failed");
    expect(errorMarkup).not.toContain("Complete");
  });
});

describe("toolkit render adapter patterns", () => {
  it("renders link previews safely across loading -> partial -> ready", () => {
    const loadingMarkup = renderLinkPreviewTool({
      status: RUNNING_STATUS,
      result: {},
    });
    const partialMarkup = renderLinkPreviewTool({
      status: RUNNING_STATUS,
      result: linkPreviewPresets.basic.data.linkPreview,
    });
    const readyMarkup = renderLinkPreviewTool({
      status: COMPLETE_STATUS,
      result: linkPreviewPresets.basic.data.linkPreview,
    });

    expect(loadingMarkup).toContain("Loading preview...");
    expect(partialMarkup).toContain("Preview is streaming");
    expect(partialMarkup).toContain("React Server Components");
    expect(readyMarkup).toContain("React Server Components");
    expect(readyMarkup).not.toContain("Preview is streaming");
  });

  it("renders option list safely for args-driven and result-driven phases", () => {
    const args = optionListPresets["max-selections"].data;

    const interactiveMarkup = renderOptionListTool({
      status: REQUIRES_ACTION_STATUS,
      args,
      result: undefined,
    });
    const partialMarkup = renderOptionListTool({
      status: RUNNING_STATUS,
      args,
      result: ["good", "fast"],
    });
    const readyMarkup = renderOptionListTool({
      status: COMPLETE_STATUS,
      args,
      result: ["good", "fast"],
    });

    expect(interactiveMarkup).toContain("Choose an option");
    expect(interactiveMarkup).toContain("Good");
    expect(partialMarkup).toContain("Selection is streaming");
    expect(readyMarkup).toContain("Good");
    expect(readyMarkup).toContain("Fast");
  });
});
