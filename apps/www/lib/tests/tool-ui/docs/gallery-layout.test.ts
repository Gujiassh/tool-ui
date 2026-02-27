import { describe, expect, test } from "vitest";

import {
  GALLERY_DESKTOP_GRID_CLASS,
  GALLERY_LAYOUT_CLASS,
  GALLERY_STANDARD_PREVIEW_WRAPPER_CLASS,
} from "@/lib/docs/gallery-layout";

describe("gallery page layout", () => {
  test("uses deterministic two-stack layout at lg instead of CSS columns", () => {
    expect(GALLERY_LAYOUT_CLASS).toContain("w-full");
    expect(GALLERY_LAYOUT_CLASS).not.toContain("columns-");
    expect(GALLERY_DESKTOP_GRID_CLASS).toContain("lg:grid-cols-2");
    expect(GALLERY_DESKTOP_GRID_CLASS).not.toContain("columns-");
  });

  test("centers standardized preview wrappers for narrow components", () => {
    expect(GALLERY_STANDARD_PREVIEW_WRAPPER_CLASS).toContain("max-w-[680px]");
    expect(GALLERY_STANDARD_PREVIEW_WRAPPER_CLASS).toContain("flex");
    expect(GALLERY_STANDARD_PREVIEW_WRAPPER_CLASS).toContain("justify-center");
  });
});
