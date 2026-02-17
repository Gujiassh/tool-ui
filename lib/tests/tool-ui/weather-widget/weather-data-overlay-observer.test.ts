import { afterEach, describe, expect, test, vi } from "vitest";

import { observeCardDimensions } from "@/lib/weather-authoring/weather-widget/weather-data-overlay";

describe("weather-data-overlay resize observer guard", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("returns a safe no-op cleanup when ResizeObserver is unavailable", () => {
    vi.stubGlobal("ResizeObserver", undefined);

    const cleanup = observeCardDimensions({} as HTMLDivElement, vi.fn());

    expect(typeof cleanup).toBe("function");
    expect(() => cleanup()).not.toThrow();
  });

  test("observes and disconnects when ResizeObserver exists", () => {
    const observe = vi.fn();
    const disconnect = vi.fn();

    class MockResizeObserver {
      constructor(_callback: ResizeObserverCallback) {}
      observe(target: Element) {
        observe(target);
      }
      disconnect() {
        disconnect();
      }
    }

    vi.stubGlobal(
      "ResizeObserver",
      MockResizeObserver as unknown as typeof ResizeObserver,
    );

    const element = {} as HTMLDivElement;
    const cleanup = observeCardDimensions(element, vi.fn());

    expect(observe).toHaveBeenCalledWith(element);
    cleanup();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
