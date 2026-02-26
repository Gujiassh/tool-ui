import { describe, expect, test } from "vitest";

import { GALLERY_COLUMNS_CLASS } from "@/lib/docs/gallery-layout";

describe("gallery page layout", () => {
  test("keeps a single column below the lg breakpoint (~1024px)", () => {
    expect(GALLERY_COLUMNS_CLASS).toContain("columns-1");
    expect(GALLERY_COLUMNS_CLASS).toContain("lg:columns-2");
    expect(GALLERY_COLUMNS_CLASS).toContain("w-full");
    expect(GALLERY_COLUMNS_CLASS).not.toContain("md:columns-2");
  });
});
