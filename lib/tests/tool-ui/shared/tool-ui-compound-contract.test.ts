import { createElement, type ComponentType, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DecisionActions,
  LocalActions,
  ToolUI,
  createDecisionResult,
} from "@/components/tool-ui/shared";

const h = createElement;
const ToolUIRoot = ToolUI as unknown as ComponentType<{
  id: string;
  children?: ReactNode;
}>;

const localActions = [{ id: "export", label: "Export" }];
const decisionActions = [{ id: "confirm", label: "Confirm" }];

describe("tool-ui compound contracts", () => {
  it("keeps ToolUI.Actions hidden before surface mount effect", () => {
    const html = renderToStaticMarkup(
      h(
        ToolUIRoot,
        { id: "compound-test" },
        h(ToolUI.Surface, null, h("div", { "data-slot": "surface" }, "Surface")),
        h(
          ToolUI.Actions,
          null,
          h(ToolUI.LocalActions, {
            actions: localActions,
            onAction: async () => undefined,
          }),
        ),
      ),
    );

    expect(html).toContain('data-slot="surface"');
    expect(html).not.toContain('data-slot="tool-ui-actions"');
    expect(html).not.toContain('data-slot="local-actions"');
  });

  it("allows LocalActions to inherit id from ToolUI context", () => {
    const html = renderToStaticMarkup(
      h(
        ToolUIRoot,
        { id: "tool-ui-context-id" },
        h(ToolUI.LocalActions, {
          actions: localActions,
          onAction: async () => undefined,
        }),
      ),
    );

    expect(html).toContain('data-tool-ui-id="tool-ui-context-id"');
    expect(html).toContain('data-slot="local-actions"');
  });

  it("throws when LocalActions renders without ToolUI context and no explicit id", () => {
    expect(() =>
      renderToStaticMarkup(
        h(LocalActions, {
          actions: localActions,
          onAction: async () => undefined,
        }),
      ),
    ).toThrow("LocalActions requires a ToolUI provider or an explicit id prop.");
  });

  it("throws when DecisionActions renders without ToolUI context and no explicit id", () => {
    expect(() =>
      renderToStaticMarkup(
        h(DecisionActions, {
          actions: decisionActions,
          onAction: async (action) =>
            createDecisionResult({
              decisionId: "decision-contract",
              action,
            }),
          onCommit: async () => undefined,
        }),
      ),
    ).toThrow(
      "DecisionActions requires a ToolUI provider or an explicit id prop.",
    );
  });
});
