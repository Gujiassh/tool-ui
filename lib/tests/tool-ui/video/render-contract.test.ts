import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { Video } from "@/components/tool-ui/video";

const BASE_VIDEO_PROPS = {
  id: "video-contract",
  assetId: "asset-video-contract",
  src: "https://archive.org/download/NatureStockVideo/IMG_9500_.mp4",
} as const;

describe("video render contract", () => {
  test("applies contain fit class when requested", () => {
    const html = renderToStaticMarkup(
      React.createElement(Video, {
        ...BASE_VIDEO_PROPS,
        fit: "contain" as const,
      }),
    );

    expect(html).toContain("object-contain");
  });

  test("renders metadata fields carried by the serializable schema", () => {
    const html = renderToStaticMarkup(
      React.createElement(Video, {
        ...BASE_VIDEO_PROPS,
        title: "Forest Canopy",
        description: "Sunlight filtering through the trees.",
        domain: "archive.org",
        durationMs: 8000,
        createdAt: "2025-01-15T08:00:00.000Z",
        source: {
          label: "Archive.org",
          url: "https://archive.org/",
        },
      }),
    );

    expect(html).toContain("Forest Canopy");
    expect(html).toContain("Sunlight filtering through the trees.");
    expect(html).toContain("archive.org");
    expect(html).toContain("Archive.org");
    expect(html).toContain("0:08");
    expect(html).toContain('dateTime="2025-01-15T08:00:00.000Z"');
  });
});
