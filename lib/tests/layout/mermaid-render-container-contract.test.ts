// @vitest-environment jsdom
import { createElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const initializeMock = vi.fn();
const renderMock = vi.fn().mockResolvedValue({ svg: "<svg></svg>" });
const reactActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light" }),
}));

vi.mock("mermaid", () => ({
  default: {
    initialize: initializeMock,
    render: renderMock,
  },
}));

describe("mermaid render container contract", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  beforeEach(() => {
    vi.resetModules();
    container = document.createElement("div");
    document.body.appendChild(container);
    initializeMock.mockClear();
    renderMock.mockClear();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root!.unmount();
      });
      root = null;
    }
    container.remove();
  });

  it("passes an explicit container element to mermaid.render to avoid body-level temp nodes", async () => {
    const { Mermaid } = await import("@/app/components/mdx/mermaid");

    root = createRoot(container);

    await act(async () => {
      root!.render(createElement(Mermaid, { chart: "graph TD\n  A-->B" }));
    });

    await act(async () => {
      for (let i = 0; i < 50 && renderMock.mock.calls.length === 0; i += 1) {
        await Promise.resolve();
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    });

    expect(renderMock).toHaveBeenCalled();
    const thirdArg = renderMock.mock.calls[0]?.[2];
    expect(thirdArg).toBeInstanceOf(HTMLElement);
  });
});
