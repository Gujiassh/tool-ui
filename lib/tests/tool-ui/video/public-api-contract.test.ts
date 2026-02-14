import { describe, expect, test } from "vitest";

import * as VideoUi from "@/components/tool-ui/video";

describe("video public api contract", () => {
  test("does not expose internal state provider or hooks", () => {
    expect(VideoUi).not.toHaveProperty("VideoProvider");
    expect(VideoUi).not.toHaveProperty("useVideo");
  });

  test("exposes compound component root syntax", () => {
    expect(VideoUi.Video).toHaveProperty("Root");
    expect(typeof VideoUi.Video.Root).toBe("function");
  });
});
