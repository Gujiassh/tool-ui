import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const COMPONENT_PREVIEW_SHELL_PATH = path.join(
  process.cwd(),
  "app/docs/_components/component-preview-shell.tsx",
);

describe("component preview panel id contract", () => {
  test("uses explicit deterministic ids for panel group, panels, and resize handles", () => {
    const source = fs.readFileSync(COMPONENT_PREVIEW_SHELL_PATH, "utf8");

    expect(source).toContain("panelIdBase");
    expect(source).toContain("id={`${panelIdBase}-group`}");
    expect(source).toContain("id={`${panelIdBase}-left`}");
    expect(source).toContain("id={`${panelIdBase}-center`}");
    expect(source).toContain("id={`${panelIdBase}-right`}");
    expect(source).toContain("id={`${panelIdBase}-left-handle`}");
    expect(source).toContain("id={`${panelIdBase}-right-handle`}");
  });
});

