import { describe, expect, test } from "vitest";

import { resolveTocIndicatorState } from "@/app/docs/_components/toc-indicator-state";

describe("docs toc indicator state", () => {
  test("does not animate when the indicator is positioned for the first time", () => {
    const state = resolveTocIndicatorState({
      reducedMotion: false,
      measuredTop: 48,
    });

    expect(state.top).toBe(48);
    expect(state.transition).toBe("none");
  });

  test("disables transition when reduced motion is enabled", () => {
    const state = resolveTocIndicatorState({
      reducedMotion: true,
      measuredTop: 64,
      hasPositioned: true,
    });

    expect(state.transition).toBe("none");
  });

  test("animates subsequent position changes after first placement", () => {
    const state = resolveTocIndicatorState({
      reducedMotion: false,
      measuredTop: 96,
      hasPositioned: true,
    });

    expect(state.transition).toBe("top 150ms ease-out");
  });
});
