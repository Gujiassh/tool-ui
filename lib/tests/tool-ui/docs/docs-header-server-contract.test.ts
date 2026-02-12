import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const DOCS_HEADER_PATH = path.join(
  process.cwd(),
  "app/docs/_components/docs-header.tsx",
);

describe("docs header server/client boundary contract", () => {
  test("does not invoke client preview config helpers from server code", () => {
    const content = fs.readFileSync(DOCS_HEADER_PATH, "utf8");

    expect(content).not.toContain("getPreviewConfig(");
    expect(content).not.toContain('from "@/lib/docs/preview-config"');
  });
});
