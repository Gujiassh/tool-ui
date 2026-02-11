import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const GALLERY_PAGE_PATH = path.join(process.cwd(), "app/docs/gallery/page.tsx");

describe("gallery layout contract", () => {
  test("preview card does not wrap children with an extra inner container", () => {
    const source = fs.readFileSync(GALLERY_PAGE_PATH, "utf8");

    // Extra wrappers inside the flex card can collapse width-sensitive components
    // such as the data table.
    expect(source).not.toContain('<div className="relative">{children}</div>');
  });

  test("preview card uses scoped group selectors to avoid nested hover collisions", () => {
    const source = fs.readFileSync(GALLERY_PAGE_PATH, "utf8");

    // Generic `group` on the gallery wrapper leaks hover state to nested
    // components that also use `group-hover:*` (e.g. option list items).
    expect(source).toContain('className={cn("group/gallery-card relative pt-8"');
    expect(source).toContain("group-hover/gallery-card:translate-y-0");
    expect(source).toContain("group-hover/gallery-card:opacity-100");
    expect(source).toContain("group-focus-within/gallery-card:translate-y-0");
    expect(source).toContain("group-focus-within/gallery-card:opacity-100");

    expect(source).not.toContain('className={cn("group relative pt-8"');
  });
});
