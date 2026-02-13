// @vitest-environment jsdom

import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { describe, expect, it } from "vitest";
import { ParameterSlider } from "@/components/tool-ui/parameter-slider";

const h = createElement;
const reactActEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean;
};
reactActEnvironment.IS_REACT_ACT_ENVIRONMENT = true;

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  (
    globalThis as typeof globalThis & {
      ResizeObserver: typeof ResizeObserverStub;
    }
  ).ResizeObserver = ResizeObserverStub;
}

if (typeof HTMLElement.prototype.setPointerCapture !== "function") {
  HTMLElement.prototype.setPointerCapture = () => {};
}
if (typeof HTMLElement.prototype.releasePointerCapture !== "function") {
  HTMLElement.prototype.releasePointerCapture = () => {};
}
if (typeof HTMLElement.prototype.hasPointerCapture !== "function") {
  HTMLElement.prototype.hasPointerCapture = () => false;
}

type RectSpec = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function createRect({ left, top, width, height }: RectSpec): DOMRect {
  const right = left + width;
  const bottom = top + height;
  return {
    x: left,
    y: top,
    left,
    top,
    right,
    bottom,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect;
}

function installGeometryMock() {
  const original = HTMLElement.prototype.getBoundingClientRect;

  HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRectMock() {
    const className = this.className;
    if (
      typeof className === "string" &&
      className.includes("h-12 w-full grow overflow-hidden")
    ) {
      return createRect({ left: 0, top: 0, width: 220, height: 48 });
    }

    const text = this.textContent?.trim();
    if (text === "Gain") {
      return createRect({ left: 16, top: 14, width: 44, height: 20 });
    }
    if (text === "20") {
      return createRect({ left: 172, top: 14, width: 20, height: 20 });
    }

    return createRect({ left: 0, top: 0, width: 0, height: 0 });
  };

  return () => {
    HTMLElement.prototype.getBoundingClientRect = original;
  };
}

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function renderClient(node: ReactNode): Promise<{
  container: HTMLDivElement;
  root: Root;
}> {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(node);
  });
  await flushEffects();

  return { container, root };
}

async function cleanupClientRender(root: Root, container: HTMLDivElement) {
  await act(async () => {
    root.unmount();
  });
  container.remove();
}

describe("parameter-slider motion contract", () => {
  it("keeps handle split animation active when drag starts near overlapping text", async () => {
    const restoreGeometry = installGeometryMock();
    try {
      const { container, root } = await renderClient(
        h(ParameterSlider, {
          id: "parameter-slider-motion-test",
          sliders: [
            {
              id: "gain",
              label: "Gain",
              min: 0,
              max: 100,
              value: 20,
            },
          ],
        }),
      );

      const sliderRoot = container.querySelector<HTMLElement>("#gain");
      expect(sliderRoot).not.toBeNull();
      if (!sliderRoot) {
        await cleanupClientRender(root, container);
        return;
      }

      const thumb = sliderRoot.querySelector<HTMLElement>('[role="slider"]');
      expect(thumb).not.toBeNull();
      if (!thumb) {
        await cleanupClientRender(root, container);
        return;
      }

      const topSegment = thumb.querySelector<HTMLElement>(
        'span[class*="top-0"][class*="left-1/2"]',
      );
      const fillLayer = sliderRoot.querySelector<HTMLElement>(
        'span.grow > div[style*="clip-path"]',
      );
      const reflectionLayer = sliderRoot.querySelector<HTMLElement>(
        'div[style*="mix-blend-mode"]',
      );
      const track = sliderRoot.querySelector<HTMLElement>("span.grow");
      const label = Array.from(sliderRoot.querySelectorAll("span")).find(
        (element) => element.textContent?.trim() === "Gain",
      );
      const value = Array.from(sliderRoot.querySelectorAll("span")).find(
        (element) => element.textContent?.trim() === "20",
      );

      expect(topSegment).not.toBeNull();
      expect(fillLayer).not.toBeNull();
      expect(reflectionLayer).not.toBeNull();
      expect(track).not.toBeNull();
      expect(label).not.toBeUndefined();
      expect(value).not.toBeUndefined();
      if (
        !topSegment ||
        !fillLayer ||
        !reflectionLayer ||
        !track ||
        !label ||
        !value
      ) {
        await cleanupClientRender(root, container);
        return;
      }

      expect(track.getBoundingClientRect().width).toBe(220);
      expect(label.getBoundingClientRect().width).toBe(44);
      expect(value.getBoundingClientRect().width).toBe(20);

      expect(topSegment.style.height).toBe("50%");

      await act(async () => {
        sliderRoot.dispatchEvent(
          new Event("pointerover", { bubbles: true, cancelable: true }),
        );
      });
      await flushEffects();

      const hoveredTopSegment = sliderRoot.querySelector<HTMLElement>(
        '[role="slider"] span[class*="top-0"][class*="left-1/2"]',
      );
      expect(hoveredTopSegment).not.toBeNull();
      if (!hoveredTopSegment) {
        await cleanupClientRender(root, container);
        return;
      }
      expect(hoveredTopSegment.style.height).toContain("calc(");

      await act(async () => {
        thumb.dispatchEvent(
          new Event("pointerdown", { bubbles: true, cancelable: true }),
        );
      });
      await flushEffects();

      const draggedTopSegment = sliderRoot.querySelector<HTMLElement>(
        '[role="slider"] span[class*="top-0"][class*="left-1/2"]',
      );
      expect(draggedTopSegment).not.toBeNull();
      if (!draggedTopSegment) {
        await cleanupClientRender(root, container);
        return;
      }
      expect(draggedTopSegment.style.height).toContain("calc(");
      expect(draggedTopSegment.style.height).not.toBe("50%");

      // Drag state should stay smoothed with short linear transitions.
      const rootTokens = sliderRoot.className.split(/\s+/);
      const fillTokens = fillLayer.className.split(/\s+/);
      const reflectionTokens = reflectionLayer.className.split(/\s+/);
      expect(sliderRoot.className).toContain("[&>span]:duration-45");
      expect(rootTokens).not.toContain("[&>span]:transition-none");
      expect(fillLayer.className).toContain("transition-[clip-path] duration-45");
      expect(fillTokens).not.toContain("transition-none");
      expect(reflectionLayer.className).toContain(
        "transition-[opacity,background] duration-45",
      );
      expect(reflectionTokens).not.toContain("transition-none");

      await cleanupClientRender(root, container);
    } finally {
      restoreGeometry();
    }
  });
});
