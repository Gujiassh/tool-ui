import { describe, expect, test } from "vitest";

import { createActionExecutionLock } from "@/components/tool-ui/shared/use-action-buttons";

describe("action execution lock contract", () => {
  test("allows one execution at a time", () => {
    const lock = createActionExecutionLock();

    expect(lock.tryAcquire()).toBe(true);
    expect(lock.tryAcquire()).toBe(false);

    lock.release();
    expect(lock.tryAcquire()).toBe(true);
  });
});
