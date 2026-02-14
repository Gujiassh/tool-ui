import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const VIDEO_SOURCE_PATH = path.join(
  process.cwd(),
  "components/tool-ui/video/video.tsx",
);

describe("video source contract", () => {
  const source = fs.readFileSync(VIDEO_SOURCE_PATH, "utf8");

  test("supports keyboard-visible overlay controls", () => {
    expect(source).toContain("group-focus-within:opacity-100");
  });

  test("wires href navigation through onNavigate/openSafeNavigationHref", () => {
    expect(source).toContain("onNavigate(");
    expect(source).toContain("openSafeNavigationHref");
    expect(source).toContain("sanitizeHref");
  });

  test("gates mute/unmute media events on actual mute-state changes", () => {
    expect(source).toContain("getMuteMediaEvent");
  });
});
