import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("gallery tooltip layout contract", () => {
  test("gallery cards use a single centered docs link with stacked rows", () => {
    const galleryPagePath = path.join(process.cwd(), "app/docs/gallery/page.tsx");
    const content = fs.readFileSync(galleryPagePath, "utf8");

    expect(content).toContain("label={componentMeta.name}");
    expect(content).toContain(
      "pointer-events-auto flex flex-col items-center text-center",
    );
    expect(content).not.toContain("•");
  });

  test("gallery docs link exposes a non-wrapping label row and CTA row", () => {
    const docsLinkPath = path.join(
      process.cwd(),
      "app/docs/_components/gallery-docs-link.tsx",
    );
    const content = fs.readFileSync(docsLinkPath, "utf8");

    expect(content).toMatch(/label:\s*string/);
    expect(content).toContain("whitespace-nowrap");
    expect(content).toContain("{label}");
    expect(content).toContain("View Docs");
  });
});
