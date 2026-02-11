import { describe, expect, test } from "vitest";

import { resolveNewAnimationIds } from "@/components/tool-ui/shared/motion-state";

describe("plan motion state", () => {
  test("does not animate existing todos during initial snapshot", () => {
    const result = resolveNewAnimationIds({
      seenIds: new Set(),
      currentIds: ["todo-1", "todo-2", "todo-3"],
    });

    expect(result.newIds.size).toBe(0);
    expect(Array.from(result.nextSeenIds)).toEqual(["todo-1", "todo-2", "todo-3"]);
  });

  test("animates only ids added after initial snapshot", () => {
    const result = resolveNewAnimationIds({
      seenIds: new Set(["todo-1", "todo-2"]),
      currentIds: ["todo-1", "todo-2", "todo-3"],
    });

    expect(Array.from(result.newIds)).toEqual(["todo-3"]);
  });
});
