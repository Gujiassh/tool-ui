import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { Video } from "@/components/tool-ui/video";
import { resolveVideoNavigation } from "@/components/tool-ui/video/video-helpers";

describe("video source contract", () => {
  test("supports keyboard-visible overlay controls in rendered markup", () => {
    const html = renderToStaticMarkup(
      React.createElement(Video, {
        id: "video-source-contract",
        assetId: "video-source-contract-asset",
        src: "https://archive.org/download/NatureStockVideo/IMG_9500_.mp4",
        title: "Forest Canopy",
        href: "https://archive.org/details/NatureStockVideo",
      }),
    );

    expect(html).toContain("group-focus-within:opacity-100");
    expect(html).toContain("Open");
  });

  test("resolves href navigation safely with source-url fallback", () => {
    const resolved = resolveVideoNavigation(
      "javascript:alert(1)",
      "https://archive.org/details/NatureStockVideo",
    );

    expect(resolved.sanitizedHref).toBeUndefined();
    expect(resolved.sanitizedSourceUrl).toBe(
      "https://archive.org/details/NatureStockVideo",
    );
    expect(resolved.primaryHref).toBe(
      "https://archive.org/details/NatureStockVideo",
    );
  });
});
