import { describe, expect, test, vi } from "vitest";
import { triggerSearchFromShortcut } from "@/app/docs/_components/docs-search-shortcut";

const createShortcutEvent = (props?: Partial<KeyboardEvent>) =>
  ({
    defaultPrevented: false,
    metaKey: true,
    ctrlKey: false,
    key: "k",
    preventDefault: vi.fn(),
    ...props,
  }) as unknown as KeyboardEvent;

describe("docs search keyboard shortcut", () => {
  test("opens at most once for a single keydown event object", () => {
    const onOpen = vi.fn();
    const event = createShortcutEvent();

    triggerSearchFromShortcut(event, onOpen);
    triggerSearchFromShortcut(event, onOpen);

    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
