import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("item-carousel docs contract", () => {
  const docsPath = path.resolve(process.cwd(), "app/docs/item-carousel/content.mdx");
  const content = fs.readFileSync(docsPath, "utf8");

  test("does not describe stale click-delegation behavior", () => {
    expect(content).not.toContain("checks if the event came from a button");
  });

  test("does not describe stale 300ms image transition", () => {
    expect(content).not.toContain("300ms transition");
  });
});
