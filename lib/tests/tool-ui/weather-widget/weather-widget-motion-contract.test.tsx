import { act, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { WeatherWidget } from "@/lib/weather-authoring/weather-widget/weather-widget";

vi.mock("@/lib/weather-authoring/weather-widget/effects/effect-compositor", () => ({
  EffectCompositor: () => <div data-testid="effect-compositor" />,
}));

function installMatchMedia(initialMatches: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQueryList = {
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    matches: initialMatches,
    addEventListener: vi.fn(
      (_type: string, callback: (event: MediaQueryListEvent) => void) => {
        listeners.add(callback);
      },
    ),
    removeEventListener: vi.fn(
      (_type: string, callback: (event: MediaQueryListEvent) => void) => {
        listeners.delete(callback);
      },
    ),
    addListener: vi.fn((callback: (event: MediaQueryListEvent) => void) => {
      listeners.add(callback);
    }),
    removeListener: vi.fn((callback: (event: MediaQueryListEvent) => void) => {
      listeners.delete(callback);
    }),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  vi.stubGlobal("matchMedia", vi.fn(() => mediaQueryList));

  return {
    setMatches(next: boolean) {
      (mediaQueryList as { matches: boolean }).matches = next;
      for (const listener of listeners) {
        listener({ matches: next } as MediaQueryListEvent);
      }
    },
  };
}

function installCssSupportsStub() {
  vi.stubGlobal("CSS", {
    supports: vi.fn(() => true),
  } as unknown as typeof CSS);
}

describe("weather-widget reduced motion contract", () => {
  beforeEach(() => {
    installCssSupportsStub();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("reacts to prefers-reduced-motion changes after mount", async () => {
    const media = installMatchMedia(false);

    const { queryByTestId } = render(
      <WeatherWidget
        version="3.1"
        id="weather-1"
        location={{ name: "San Francisco, CA" }}
        units={{ temperature: "fahrenheit" }}
        current={{
          conditionCode: "clear",
          temperature: 72,
          tempMin: 65,
          tempMax: 78,
        }}
        forecast={[
          {
            label: "Now",
            conditionCode: "clear",
            tempMin: 65,
            tempMax: 78,
          },
        ]}
        time={{ timeBucket: 6 }}
      />,
    );

    expect(queryByTestId("effect-compositor")).not.toBeNull();

    act(() => {
      media.setMatches(true);
    });

    await waitFor(() => {
      expect(queryByTestId("effect-compositor")).toBeNull();
    });
  });
});
