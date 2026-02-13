// @vitest-environment jsdom

import {
  act,
  createElement,
  type ComponentType,
  type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "@/components/tool-ui/data-table";
import { LinkPreview } from "@/components/tool-ui/link-preview";
import { OptionList } from "@/components/tool-ui/option-list";
import {
  safeParseSerializableOptionList,
} from "@/components/tool-ui/option-list/schema";
import { OrderSummary } from "@/components/tool-ui/order-summary";
import { ParameterSlider } from "@/components/tool-ui/parameter-slider";
import {
  safeParseSerializableParameterSlider,
} from "@/components/tool-ui/parameter-slider/schema";
import { PreferencesPanel } from "@/components/tool-ui/preferences-panel";
import {
  safeParseSerializablePreferencesPanel,
} from "@/components/tool-ui/preferences-panel/schema";
import {
  ToolUI,
  createArgsToolRenderer,
  createDecisionResult,
  createResultToolRenderer,
} from "@/components/tool-ui/shared";
import { safeParseSerializableLinkPreview } from "@/components/tool-ui/link-preview/schema";
import { DecisionResultSchema } from "@/components/tool-ui/shared/schema";

const h = createElement;
const DataTableSurface = DataTable as unknown as ComponentType<
  Record<string, unknown>
>;
const ToolUIRoot = ToolUI as unknown as ComponentType<{
  id: string;
  children?: ReactNode;
}>;
const reactActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  (
    globalThis as typeof globalThis & {
      ResizeObserver: typeof ResizeObserverStub;
    }
  ).ResizeObserver = ResizeObserverStub;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function findButtonByText(
  container: HTMLElement,
  label: string,
): HTMLButtonElement {
  const match = Array.from(container.querySelectorAll("button")).find((button) =>
    normalizeText(button.textContent).includes(label),
  );
  if (!match) {
    throw new Error(`Could not find button with label containing "${label}".`);
  }
  return match as HTMLButtonElement;
}

function findButtonByAriaLabel(
  container: HTMLElement,
  label: string,
): HTMLButtonElement {
  const match = container.querySelector(`button[aria-label="${label}"]`);
  if (!match) {
    throw new Error(`Could not find button with aria-label "${label}".`);
  }
  return match as HTMLButtonElement;
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
  });
}

async function click(element: HTMLElement) {
  await act(async () => {
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
  });
  await flushEffects();
}

async function renderClient(node: ReactNode): Promise<{
  container: HTMLDivElement;
  root: Root;
}> {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const root = createRoot(container);
  await act(async () => {
    root.render(node);
  });
  await flushEffects();

  return { container, root };
}

async function cleanupClientRender(
  root: Root,
  container: HTMLDivElement,
): Promise<void> {
  await act(async () => {
    root.unmount();
  });
  container.remove();
}

describe("docs runtime end-to-end contracts", () => {
  it("runs the /docs/actions local-actions flow end-to-end", async () => {
    const onAction = vi.fn(async (_actionId: string) => undefined);

    const app = h(
      ToolUIRoot,
      { id: "docs-local-actions" },
      h(
        ToolUI.Surface,
        null,
        h(DataTableSurface, {
          id: "docs-local-actions",
          rowIdKey: "id",
          columns: [
            { key: "merchant", label: "Merchant" },
            { key: "amount", label: "Amount", align: "right" },
          ],
          data: [{ id: "1", merchant: "Delta Airlines", amount: 847 }],
        }),
      ),
      h(
        ToolUI.Actions,
        null,
        h(ToolUI.LocalActions, {
          actions: [{ id: "export-csv", label: "Export CSV" }],
          onAction,
        }),
      ),
    );

    const { container, root } = await renderClient(app);
    expect(container.querySelector('[data-slot="data-table"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="tool-ui-actions"]')).not.toBeNull();

    const exportButton = findButtonByText(container, "Export CSV");
    await click(exportButton);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("export-csv");

    await cleanupClientRender(root, container);
  });

  it("runs the /docs/actions decision-actions flow end-to-end", async () => {
    const onCommit = vi.fn(async (_result: unknown) => undefined);

    const app = h(
      ToolUIRoot,
      { id: "docs-decision-actions" },
      h(
        ToolUI.Surface,
        null,
        h(OrderSummary, {
          id: "docs-decision-actions",
          title: "Order Summary",
          items: [{ id: "sku-1", name: "Wireless Keyboard", unitPrice: 89, quantity: 1 }],
          pricing: {
            subtotal: 89,
            shipping: 0,
            tax: 8.01,
            total: 97.01,
            currency: "USD",
          },
        }),
      ),
      h(
        ToolUI.Actions,
        null,
        h(ToolUI.DecisionActions, {
          actions: [{ id: "confirm", label: "Purchase" }],
          onAction: (action: { id: string; label: string }) =>
            createDecisionResult({
              decisionId: "docs-decision-actions-decision",
              action,
            }),
          onCommit,
        }),
      ),
    );

    const { container, root } = await renderClient(app);
    expect(container.querySelector('[data-slot="order-summary"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="decision-actions"]')).not.toBeNull();

    const purchaseButton = findButtonByText(container, "Purchase");
    await click(purchaseButton);

    expect(onCommit).toHaveBeenCalledTimes(1);
    const committed = onCommit.mock.calls[0]?.[0];
    const parsed = DecisionResultSchema.safeParse(committed);
    expect(parsed.success).toBe(true);
    if (!parsed.success) {
      throw new Error("Expected a valid decision result envelope.");
    }
    expect(parsed.data.decisionId).toBe("docs-decision-actions-decision");
    expect(parsed.data.actionId).toBe("confirm");
    expect(parsed.data.actionLabel).toBe("Purchase");

    await cleanupClientRender(root, container);
  });

  it("runs the /docs/quick-start result renderer flow for display components", async () => {
    const renderLinkPreview = createResultToolRenderer({
      safeParse: safeParseSerializableLinkPreview,
      render: (parsedResult) => h(LinkPreview, parsedResult),
    });

    const invalidNode = renderLinkPreview({
      result: { id: "invalid-link-preview" },
    });
    expect(invalidNode).toBeNull();

    const validNode = renderLinkPreview({
      result: {
        id: "link-preview-docs-flow",
        href: "https://example.com",
        title: "Example",
        description: "Example description",
      },
    });
    expect(validNode).not.toBeNull();

    const { container, root } = await renderClient(validNode);
    expect(container.querySelector('[data-slot="link-preview"]')).not.toBeNull();

    await cleanupClientRender(root, container);
  });

  it("runs the /docs/option-list args tool flow from interactive to receipt", async () => {
    const addResult = vi.fn(async (_selection: unknown) => undefined);

    const renderOptionList = createArgsToolRenderer({
      safeParse: safeParseSerializableOptionList,
      idPrefix: "format-selection",
      render: (parsedArgs, { result, addResult }) =>
        result
          ? h(OptionList, {
              ...parsedArgs,
              value: undefined,
              choice: result as string | string[] | null,
            })
          : h(OptionList, {
              ...parsedArgs,
              value: undefined,
              onConfirm: (selection) => addResult?.(selection),
            }),
    });

    const optionListArgs = {
      options: [
        { id: "json", label: "JSON" },
        { id: "markdown", label: "Markdown" },
      ],
      selectionMode: "single",
    };

    const interactive = renderOptionList({
      args: optionListArgs,
      toolCallId: "docs-option-list",
      addResult,
    });
    expect(interactive).not.toBeNull();

    const mountedInteractive = await renderClient(interactive);
    const interactiveContainer = mountedInteractive.container;
    expect(
      interactiveContainer
        .querySelector('[data-slot="option-list"]')
        ?.getAttribute("data-tool-ui-id"),
    ).toBe("format-selection-docs-option-list");

    const jsonOption = interactiveContainer.querySelector(
      'button[role="option"][data-id="json"]',
    ) as HTMLButtonElement | null;
    expect(jsonOption).not.toBeNull();
    if (!jsonOption) {
      throw new Error("Expected JSON option button to exist.");
    }

    await click(jsonOption);
    const confirmButton = findButtonByText(interactiveContainer, "Confirm");
    await click(confirmButton);

    expect(addResult).toHaveBeenCalledTimes(1);
    expect(addResult).toHaveBeenCalledWith("json");
    await cleanupClientRender(mountedInteractive.root, interactiveContainer);

    const receipt = renderOptionList({
      args: optionListArgs,
      result: "json",
      toolCallId: "docs-option-list",
      addResult,
    });
    expect(receipt).not.toBeNull();

    const mountedReceipt = await renderClient(receipt);
    const receiptContainer = mountedReceipt.container;
    const receiptNode = receiptContainer.querySelector('[data-slot="option-list"]');
    expect(receiptNode).not.toBeNull();
    expect(receiptNode?.getAttribute("data-receipt")).toBe("true");
    expect(receiptContainer.querySelector('button[aria-label*="Confirm"]')).toBeNull();
    await cleanupClientRender(mountedReceipt.root, receiptContainer);
  });

  it("runs the /docs/parameter-slider args tool flow and emits apply payloads", async () => {
    const addResult = vi.fn(async (_result: unknown) => undefined);

    const renderParameterSlider = createArgsToolRenderer({
      safeParse: safeParseSerializableParameterSlider,
      idPrefix: "parameter-slider",
      render: (parsedArgs, { addResult }) =>
        h(ParameterSlider, {
          ...parsedArgs,
          onAdjustmentAction: (actionId, values) => {
            if (actionId === "apply") {
              void addResult?.({ values });
            }
          },
        }),
    });

    const sliderArgs = {
      sliders: [
        {
          id: "exposure",
          label: "Exposure",
          min: -3,
          max: 3,
          step: 0.1,
          value: 0.3,
          unit: "EV",
          precision: 1,
        },
      ],
    };

    const app = renderParameterSlider({
      args: sliderArgs,
      toolCallId: "docs-parameter-slider",
      addResult,
    });
    expect(app).not.toBeNull();

    const { container, root } = await renderClient(app);
    expect(container.querySelector('[data-slot="parameter-slider"]')).not.toBeNull();

    const applyButton = findButtonByText(container, "Apply");
    await click(applyButton);

    expect(addResult).toHaveBeenCalledTimes(1);
    expect(addResult).toHaveBeenCalledWith({
      values: [{ id: "exposure", value: 0.3 }],
    });

    await cleanupClientRender(root, container);
  });

  it("runs the /docs/preferences-panel args tool flow for save and cancel", async () => {
    const addResult = vi.fn(async (_result: unknown) => undefined);

    const renderPreferencesPanel = createArgsToolRenderer({
      safeParse: safeParseSerializablePreferencesPanel,
      idPrefix: "preferences-panel",
      render: (parsedArgs, { addResult }) =>
        h(PreferencesPanel, {
          ...parsedArgs,
          onSave: async (values) => {
            await addResult?.({ choice: values });
          },
          onCancel: () => {
            void addResult?.({ choice: {} });
          },
        }),
    });

    const preferencesArgs = {
      sections: [
        {
          items: [
            {
              id: "notifications",
              label: "Notifications",
              description: "Receive push notifications",
              type: "switch",
              defaultChecked: false,
            },
          ],
        },
      ],
    };

    const app = renderPreferencesPanel({
      args: preferencesArgs,
      toolCallId: "docs-preferences-panel",
      addResult,
    });
    expect(app).not.toBeNull();

    const { container, root } = await renderClient(app);
    expect(container.querySelector('[data-slot="preferences-panel"]')).not.toBeNull();

    const saveButton = findButtonByText(container, "Save Changes");
    expect(saveButton.disabled).toBe(true);

    const notificationsSwitch = findButtonByAriaLabel(container, "Notifications");
    await click(notificationsSwitch);

    const refreshedSaveButton = findButtonByText(container, "Save Changes");
    expect(refreshedSaveButton.disabled).toBe(false);
    await click(refreshedSaveButton);

    expect(addResult).toHaveBeenCalledTimes(1);
    expect(addResult).toHaveBeenCalledWith({
      choice: { notifications: true },
    });

    const cancelButton = findButtonByText(container, "Cancel");
    await click(cancelButton);

    expect(addResult).toHaveBeenCalledTimes(2);
    expect(addResult).toHaveBeenLastCalledWith({ choice: {} });

    await cleanupClientRender(root, container);
  });
});
