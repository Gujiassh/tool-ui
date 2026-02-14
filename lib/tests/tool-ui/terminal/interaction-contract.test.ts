// @vitest-environment jsdom

import {
  act,
  createElement,
  type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { Terminal } from "@/components/tool-ui/terminal";

const reactActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

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

async function rerenderClient(root: Root, node: ReactNode): Promise<void> {
  await act(async () => {
    root.render(node);
  });
  await flushEffects();
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

describe("terminal interaction contract", () => {
  it("supports controlled collapse state via onExpandedChange", async () => {
    const onExpandedChange = vi.fn();

    const { container, root } = await renderClient(
      createElement(Terminal, {
        id: "terminal-controlled-expand",
        command: "cat logs.txt",
        stdout: "line-1\nline-2\nline-3",
        exitCode: 0,
        maxCollapsedLines: 2,
        expanded: false,
        onExpandedChange,
      }),
    );

    try {
      const showAllButton = findButtonByText(container, "Show all");
      await click(showAllButton);

      expect(onExpandedChange).toHaveBeenCalledTimes(1);
      expect(onExpandedChange).toHaveBeenCalledWith(true);
    } finally {
      await cleanupClientRender(root, container);
    }
  });

  it("does not show copied icon when output disappears", async () => {
    const originalClipboard = navigator.clipboard;
    const writeText = vi.fn(async () => undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    const initialNode = createElement(Terminal, {
      id: "terminal-copy-reset",
      command: "pnpm test",
      stdout: "tests passed",
      exitCode: 0,
    });

    const emptyNode = createElement(Terminal, {
      id: "terminal-copy-reset",
      command: "pnpm test",
      exitCode: 0,
    });

    const { container, root } = await renderClient(initialNode);

    try {
      await click(findButtonByAriaLabel(container, "Copy output"));
      expect(writeText).toHaveBeenCalledWith("tests passed");
      expect(container.querySelector(".lucide-check")).not.toBeNull();

      await rerenderClient(root, emptyNode);

      expect(findButtonByAriaLabel(container, "No output to copy")).not.toBeNull();
      expect(container.querySelector(".lucide-check")).toBeNull();
    } finally {
      await cleanupClientRender(root, container);
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: originalClipboard,
      });
    }
  });
});
