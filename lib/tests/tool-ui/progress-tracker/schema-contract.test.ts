import { describe, expect, it } from "vitest";
import {
  parseSerializableProgressTracker,
  safeParseSerializableProgressTracker,
} from "@/components/tool-ui/progress-tracker/schema";

const baseProgressTracker = {
  id: "progress-tracker-schema-contract",
  steps: [
    { id: "step-1", label: "First", status: "completed" as const },
    { id: "step-2", label: "Second", status: "in-progress" as const },
  ],
};

describe("progress tracker schema contract", () => {
  it("rejects duplicate step ids", () => {
    const duplicateIdPayload = {
      ...baseProgressTracker,
      steps: [
        { id: "step-1", label: "First", status: "completed" as const },
        { id: "step-1", label: "Duplicate", status: "pending" as const },
      ],
    };

    expect(() => parseSerializableProgressTracker(duplicateIdPayload)).toThrow();
    expect(safeParseSerializableProgressTracker(duplicateIdPayload)).toBeNull();
  });

  it("rejects non-finite elapsedTime values", () => {
    const payload = {
      ...baseProgressTracker,
      elapsedTime: Number.POSITIVE_INFINITY,
    };

    expect(() => parseSerializableProgressTracker(payload)).toThrow();
    expect(safeParseSerializableProgressTracker(payload)).toBeNull();
  });

  it("rejects negative elapsedTime values", () => {
    const payload = {
      ...baseProgressTracker,
      elapsedTime: -1,
    };

    expect(() => parseSerializableProgressTracker(payload)).toThrow();
    expect(safeParseSerializableProgressTracker(payload)).toBeNull();
  });

  it("rejects responseActions in v2 display-only payloads", () => {
    const payload = {
      ...baseProgressTracker,
      responseActions: [{ id: "cancel", label: "Cancel" }],
    };

    expect(() => parseSerializableProgressTracker(payload)).toThrow();
    expect(safeParseSerializableProgressTracker(payload)).toBeNull();
  });

  it("rejects legacy receipt payloads to avoid accepted-but-ignored state", () => {
    const payload = {
      ...baseProgressTracker,
      receipt: {
        outcome: "success" as const,
        summary: "Done",
        at: new Date().toISOString(),
      },
    };

    expect(() => parseSerializableProgressTracker(payload)).toThrow();
    expect(safeParseSerializableProgressTracker(payload)).toBeNull();
  });
});
