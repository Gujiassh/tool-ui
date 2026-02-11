import { describe, expect, test } from "vitest";

import { resolveSafeNavigationHref } from "@/components/tool-ui/shared/media/safe-navigation";

describe("resolveSafeNavigationHref", () => {
  test("returns undefined for unsafe URLs", () => {
    expect(resolveSafeNavigationHref("javascript:alert(1)")).toBeUndefined();
    expect(resolveSafeNavigationHref("data:text/html,hello")).toBeUndefined();
  });

  test("returns first safe candidate from fallbacks", () => {
    expect(
      resolveSafeNavigationHref(
        undefined,
        "javascript:alert(1)",
        "https://assistant-ui.com/docs",
      ),
    ).toBe("https://assistant-ui.com/docs");
  });

  test("keeps safe http(s) URLs", () => {
    expect(resolveSafeNavigationHref("https://assistant-ui.com")).toBe(
      "https://assistant-ui.com/",
    );
    expect(resolveSafeNavigationHref("http://example.com/path")).toBe(
      "http://example.com/path",
    );
  });
});
