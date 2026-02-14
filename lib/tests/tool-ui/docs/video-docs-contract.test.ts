import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const VIDEO_DOCS_PATH = path.join(process.cwd(), "app/docs/video/content.mdx");

describe("video docs contract", () => {
  const content = fs.readFileSync(VIDEO_DOCS_PATH, "utf8");

  test("matches runtime defaults for playback and fit", () => {
    expect(content).toContain(
      "autoPlay: { description: \"Auto-play video (muted)\", type: \"boolean\", default: \"true\" }",
    );
    expect(content).toContain(
      "fit: {\n      description: \"Object fit mode\",\n      type: \"'cover' | 'contain'\",\n      default: \"'cover'\"",
    );
  });

  test("documents defaultMuted prop instead of a muted prop", () => {
    expect(content).toContain(
      "defaultMuted: { description: \"Initial mute state\", type: \"boolean\", default: \"true\" }",
    );
    expect(content).not.toContain(
      "muted: { description: \"Mute video\", type: \"boolean\"",
    );
  });
});
