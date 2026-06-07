// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { ComponentPreviewShell } from "@/app/docs/_components/component-preview-shell";

describe("ComponentPreviewShell", () => {
  test("does not render duplicate install command chrome above the preview area", () => {
    render(
      <ComponentPreviewShell
        componentId="link-preview"
        sidebar={<div>sidebar</div>}
        preview={<div>preview</div>}
        chatPanel={<div>chat</div>}
        codePanel={<div>code</div>}
        code={"const x = 1;"}
      />,
    );

    expect(screen.queryByText("tool-agent")).toBeNull();
    expect(screen.queryByText("shadcn")).toBeNull();
    expect(screen.getByText("preview")).toBeInTheDocument();
  });
});
