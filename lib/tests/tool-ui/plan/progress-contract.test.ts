import { describe, expect, test } from "vitest";

import {
  calculatePlanProgress,
  shouldCelebrateProgress,
} from "@/components/tool-ui/plan/progress";

describe("plan progress contract", () => {
  test("handles empty todo lists without NaN", () => {
    expect(calculatePlanProgress({ completedCount: 0, totalCount: 0 })).toBe(0);
  });

  test("computes progress for non-empty lists", () => {
    expect(calculatePlanProgress({ completedCount: 2, totalCount: 4 })).toBe(50);
  });

  test("celebrates only on transition to 100", () => {
    expect(shouldCelebrateProgress({ previous: 75, next: 100 })).toBe(true);
    expect(shouldCelebrateProgress({ previous: 100, next: 100 })).toBe(false);
    expect(shouldCelebrateProgress({ previous: 100, next: 80 })).toBe(false);
  });
});
