import { describe, expect, it } from "vitest";
import {
  parseSerializablePlan,
  safeParseSerializablePlan,
} from "@/components/tool-ui/plan";

const basePlan = {
  id: "plan-schema-contract",
  title: "Schema Contract",
  todos: [
    { id: "todo-1", label: "First", status: "pending" as const },
    { id: "todo-2", label: "Second", status: "completed" as const },
  ],
};

describe("plan schema contract", () => {
  it("rejects duplicate todo ids", () => {
    const duplicateIdPayload = {
      ...basePlan,
      todos: [
        { id: "todo-1", label: "First", status: "pending" as const },
        { id: "todo-1", label: "Duplicate", status: "completed" as const },
      ],
    };

    expect(() => parseSerializablePlan(duplicateIdPayload)).toThrow();
    expect(safeParseSerializablePlan(duplicateIdPayload)).toBeNull();
  });

  it("rejects non-integer maxVisibleTodos values", () => {
    const payload = {
      ...basePlan,
      maxVisibleTodos: 2.5,
    };

    expect(() => parseSerializablePlan(payload)).toThrow();
    expect(safeParseSerializablePlan(payload)).toBeNull();
  });

  it("rejects non-finite maxVisibleTodos values", () => {
    const payload = {
      ...basePlan,
      maxVisibleTodos: Number.POSITIVE_INFINITY,
    };

    expect(() => parseSerializablePlan(payload)).toThrow();
    expect(safeParseSerializablePlan(payload)).toBeNull();
  });
});
