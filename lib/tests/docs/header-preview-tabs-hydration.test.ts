// @vitest-environment jsdom

import { act } from "@testing-library/react";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/lib/analytics", () => ({
  analytics: {
    component: {
      tabSwitched: vi.fn(),
    },
  },
}));

vi.mock("@/lib/docs/gallery-usage-code", () => ({
  getImportLine: () => 'import { GeoMap } from "@/components/tool-ui/geo-map";',
}));

vi.mock("fumadocs-ui/components/dynamic-codeblock", () => ({
  DynamicCodeBlock: ({ code }: { code: string }) =>
    createElement("pre", null, code),
}));

vi.mock("@/lib/docs/preview-config", async () => {
  const React = await import("react");

  return {
    getPreviewConfig: () => ({
      presets: {
        default: {
          data: {},
          generateExampleCode: () => '<GeoMap id="demo" markers={markers} />',
        },
      },
      defaultPreset: "default",
      // Intentionally non-deterministic to model preview content that differs across renders.
      renderComponent: () =>
        React.createElement(
          "div",
          { "data-random": Math.random().toString() },
          "Preview",
        ),
    }),
  };
});

import { HeaderPreviewTabs } from "@/app/docs/_components/header-preview-tabs";

describe("HeaderPreviewTabs hydration", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("does not SSR preview tab markup before hydration", async () => {
    const props = { componentId: "geo-map" as never };

    const html = renderToString(createElement(HeaderPreviewTabs, props));
    expect(html).toBe("");

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.append(container);

    let root: ReturnType<typeof hydrateRoot> | null = null;
    await act(async () => {
      root = hydrateRoot(container, createElement(HeaderPreviewTabs, props));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(root).not.toBeNull();
    await act(async () => {
      root?.unmount();
    });
  });
});
