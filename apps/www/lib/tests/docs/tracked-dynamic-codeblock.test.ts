// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { blockCopiedSpy, installSnippetCopiedSpy } = vi.hoisted(() => ({
  blockCopiedSpy: vi.fn(),
  installSnippetCopiedSpy: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  analytics: {
    code: {
      blockCopied: blockCopiedSpy,
    },
    docs: {
      installSnippetCopied: installSnippetCopiedSpy,
    },
  },
}));

vi.mock("fumadocs-ui/components/dynamic-codeblock", () => {
  const MockCopyButton = ({
    children,
    containerRef: _containerRef,
    ...props
  }: {
    children?: ReactNode;
    containerRef?: unknown;
  } & Record<string, unknown>) =>
    createElement(
      "button",
      {
        type: "button",
        "aria-label": "Copy Text",
        ...props,
      },
      children ?? "Copy",
    );

  return {
    DynamicCodeBlock: ({
      codeblock,
    }: {
      codeblock?: {
        Actions?: (props: {
          className?: string;
          children?: ReactNode;
        }) => ReactNode;
      };
    }) => {
      const defaultCopyButton = createElement(MockCopyButton, {
        containerRef: { current: null },
      });

      if (codeblock?.Actions) {
        return createElement(
          "div",
          null,
          codeblock.Actions({
            className: "actions",
            children: defaultCopyButton,
          }),
        );
      }

      return createElement("div", null, defaultCopyButton);
    },
  };
});

import { TrackedDynamicCodeBlock } from "@/app/docs/_components/tracked-dynamic-codeblock";

describe("TrackedDynamicCodeBlock", () => {
  beforeEach(() => {
    blockCopiedSpy.mockClear();
    installSnippetCopiedSpy.mockClear();
  });

  test("replaces generic copy button labels with contextual code labels", () => {
    render(
      createElement(TrackedDynamicCodeBlock, {
        lang: "tsx",
        code: 'import { GeoMap } from "@/components/tool-ui/geo-map";\n\n<GeoMap id="fleet" markers={markers} />',
      }),
    );

    const button = screen.getByRole("button");
    const label = button.getAttribute("aria-label");

    expect(label).not.toBeNull();
    expect(label).not.toBe("Copy Text");
    expect(label).toContain("Copy TSX snippet");
    expect(label).toContain("import { GeoMap }");
  });

  test("uses install-command specific labels and analytics source", () => {
    render(
      createElement(TrackedDynamicCodeBlock, {
        lang: "bash",
        code: "npx shadcn@latest add @tool-ui/geo-map",
      }),
    );

    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-label")).toBe(
      "Copy registry install command",
    );

    fireEvent.click(button);

    expect(blockCopiedSpy).toHaveBeenCalledWith("bash", "docs_installation");
    expect(installSnippetCopiedSpy).toHaveBeenCalledWith(
      "registry",
      "docs_code_block",
    );
  });
});
