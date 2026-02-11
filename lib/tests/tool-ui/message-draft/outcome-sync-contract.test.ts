import { describe, expect, it } from "vitest";
import {
  resolveOutcomeTransition,
  resolveStateFromOutcome,
} from "@/components/tool-ui/message-draft/message-draft";

describe("message-draft outcome sync contracts", () => {
  it("maps outcome to deterministic state", () => {
    expect(resolveStateFromOutcome(undefined)).toBe("review");
    expect(resolveStateFromOutcome("sent")).toBe("sent");
    expect(resolveStateFromOutcome("cancelled")).toBe("cancelled");
  });

  it("requests sync when outcome changes after mount", () => {
    expect(resolveOutcomeTransition(undefined, "sent")).toBe("sent");
    expect(resolveOutcomeTransition("sent", "cancelled")).toBe("cancelled");
    expect(resolveOutcomeTransition("cancelled", undefined)).toBe("review");
  });

  it("does not force sync when outcome is unchanged", () => {
    expect(resolveOutcomeTransition(undefined, undefined)).toBeNull();
    expect(resolveOutcomeTransition("sent", "sent")).toBeNull();
  });
});
