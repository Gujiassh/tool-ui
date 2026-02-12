import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("image-gallery docs contract", () => {
  const docsPath = path.resolve(process.cwd(), "app/docs/image-gallery/content.mdx");
  const content = fs.readFileSync(docsPath, "utf8");

  test("does not document removed maxVisible prop", () => {
    expect(content).not.toContain("maxVisible");
  });

  test("runtime snippet uses safe parser gating", () => {
    expect(content).toContain("safeParseSerializableImageGallery");
    expect(content).toContain("safeParse:");
  });
});
