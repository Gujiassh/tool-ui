import { describe, expect, test } from "vitest";

import {
  getMuteMediaEvent,
  normalizeVideoDataForCallback,
} from "@/components/tool-ui/video/video-helpers";

describe("video mute media event helper", () => {
  test("returns null when mute state does not change", () => {
    expect(getMuteMediaEvent(true, true)).toBeNull();
    expect(getMuteMediaEvent(false, false)).toBeNull();
  });

  test("returns mute/unmute only when mute state toggles", () => {
    expect(getMuteMediaEvent(false, true)).toBe("mute");
    expect(getMuteMediaEvent(true, false)).toBe("unmute");
  });

  test("normalizes callback payload to rendered defaults", () => {
    const normalized = normalizeVideoDataForCallback(
      {
        id: "video-helper-payload",
        assetId: "asset-helper-payload",
        src: "https://archive.org/download/NatureStockVideo/IMG_9500_.mp4",
        source: {
          label: "Archive.org",
          url: "https://archive.org",
        },
      },
      {
        ratio: "16:9",
        fit: "cover",
        locale: "en-US",
        sanitizedHref: undefined,
        sanitizedSourceUrl: "https://archive.org/",
      },
    );

    expect(normalized.ratio).toBe("16:9");
    expect(normalized.fit).toBe("cover");
    expect(normalized.locale).toBe("en-US");
    expect(normalized.source?.url).toBe("https://archive.org/");
  });
});
