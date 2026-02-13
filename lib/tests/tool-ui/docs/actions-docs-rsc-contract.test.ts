import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("actions docs RSC contract", () => {
  test("keeps interactive handlers out of server-rendered MDX", () => {
    const contentPath = path.resolve(process.cwd(), "app/docs/actions/content.mdx");
    const content = fs.readFileSync(contentPath, "utf8");

    expect(content).not.toContain("onAction={");
    expect(content).not.toContain("onCommit={");
  });

  test("documents the action model and implementation guidance", () => {
    const contentPath = path.resolve(process.cwd(), "app/docs/actions/content.mdx");
    const content = fs.readFileSync(contentPath, "utf8");

    expect(content).toContain("## Action Decision Matrix");
    expect(content).toContain("## Current API Mapping");
    expect(content).toContain("## Minimal Implementation");
    expect(content).toContain("## Runtime Behavior (Current Implementation)");
    expect(content).toContain("## Practical Guidance");
  });
});
