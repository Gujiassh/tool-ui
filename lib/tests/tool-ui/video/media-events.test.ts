import { describe, expect, test } from "vitest";

import { getMuteMediaEvent } from "@/components/tool-ui/video/video-helpers";

describe("video mute media event helper", () => {
  test("returns null when mute state does not change", () => {
    expect(getMuteMediaEvent(true, true)).toBeNull();
    expect(getMuteMediaEvent(false, false)).toBeNull();
  });

  test("returns mute/unmute only when mute state toggles", () => {
    expect(getMuteMediaEvent(false, true)).toBe("mute");
    expect(getMuteMediaEvent(true, false)).toBe("unmute");
  });
});
