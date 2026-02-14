import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Terminal } from "@/components/tool-ui/terminal";

describe("terminal render contract", () => {
  it("renders a formatted duration when durationMs is provided", () => {
    const html = renderToStaticMarkup(
      React.createElement(Terminal, {
        id: "terminal-duration-contract",
        command: "pnpm test",
        stdout: "all tests passed",
        exitCode: 0,
        durationMs: 1243,
      }),
    );

    expect(html).toContain("1.2s");
  });

  it("does not over-count trailing newlines when deciding collapse", () => {
    const html = renderToStaticMarkup(
      React.createElement(Terminal, {
        id: "terminal-collapse-contract",
        command: "cat logs.txt",
        stdout: "line-1\nline-2\n",
        exitCode: 0,
        maxCollapsedLines: 2,
      }),
    );

    expect(html).not.toContain("Show all");
  });

  it("disables copy when there is no output", () => {
    const html = renderToStaticMarkup(
      React.createElement(Terminal, {
        id: "terminal-no-output-contract",
        command: "touch newfile.txt",
        exitCode: 0,
      }),
    );

    expect(html).toContain('aria-label="No output to copy"');
    expect(html).toContain("disabled");
  });
});
