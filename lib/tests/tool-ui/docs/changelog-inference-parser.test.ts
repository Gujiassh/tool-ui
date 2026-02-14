import { describe, expect, test } from "vitest";
import { sanitizeInferredReleaseNotes } from "@/lib/changelog/inference";

describe("changelog inference normalization", () => {
  test("drops empty lines and coerces non-breaking migration prompt to null", () => {
    const notes = sanitizeInferredReleaseNotes({
      breakingChanges: ["   "],
      changes: ["  First change  ", "", "Second change"],
      migrationPrompt: "Should be ignored when no breaking changes",
    });

    expect(notes.breakingChanges).toEqual([]);
    expect(notes.changes).toEqual(["First change", "Second change"]);
    expect(notes.migrationPrompt).toBeNull();
  });

  test("keeps migration prompt when breaking changes exist", () => {
    const notes = sanitizeInferredReleaseNotes({
      breakingChanges: ["Schema boundary changed"],
      changes: ["Updated exports"],
      migrationPrompt: "Update imports to /schema entrypoints.",
    });

    expect(notes.breakingChanges).toEqual(["Schema boundary changed"]);
    expect(notes.migrationPrompt).toBe(
      "Update imports to /schema entrypoints.",
    );
  });
});
