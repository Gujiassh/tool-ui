import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { galleryComponentDocs } from "@/lib/docs/gallery-component-docs";

describe("gallery component docs link contract", () => {
  test("each gallery component exposes a display name and docs href", () => {
    for (const [componentId, meta] of Object.entries(galleryComponentDocs)) {
      expect(componentId.length).toBeGreaterThan(0);
      expect(meta.name.trim().length).toBeGreaterThan(0);
      expect(meta.docsHref).toMatch(/^\/docs\/[a-z0-9-]+$/);
    }
  });

  test("each gallery docs href points to an existing docs page", () => {
    const docsRoot = path.join(process.cwd(), "app");

    for (const meta of Object.values(galleryComponentDocs)) {
      const contentPath = path.join(docsRoot, meta.docsHref, "content.mdx");
      expect(
        fs.existsSync(contentPath),
        `missing docs page for ${meta.docsHref}`,
      ).toBe(true);
    }
  });
});
