import { describe, expect, test } from "vitest";
import {
  ensureComponentCoverage,
  sanitizeInferredReleaseNotes,
} from "@/lib/changelog/inference";

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

  test("adds a breadth line when multiple components changed but are not represented", () => {
    const covered = ensureComponentCoverage(
      {
        breakingChanges: [],
        changes: ["Unified embedded action props across action-centric components."],
        migrationPrompt: null,
      },
      [
        "components/tool-ui/option-list/option-list.tsx",
        "components/tool-ui/parameter-slider/parameter-slider.tsx",
        "components/tool-ui/preferences-panel/preferences-panel.tsx",
      ],
    );

    expect(covered.changes.join("\n")).toContain("Option List");
    expect(covered.changes.join("\n")).toContain("Parameter Slider");
    expect(covered.changes.join("\n")).toContain("Preferences Panel");
  });

  test("does not add a breadth line when components are already represented", () => {
    const covered = ensureComponentCoverage(
      {
        breakingChanges: [],
        changes: [
          "Option List and Parameter Slider now share embedded action props.",
          "Preferences Panel schema now aligns with shared action payload shape.",
        ],
        migrationPrompt: null,
      },
      [
        "components/tool-ui/option-list/option-list.tsx",
        "components/tool-ui/parameter-slider/parameter-slider.tsx",
        "components/tool-ui/preferences-panel/preferences-panel.tsx",
      ],
    );

    expect(
      covered.changes.filter((line) => /Updated \d+ Tool UI components/i.test(line)),
    ).toHaveLength(0);
  });

  test("does not treat shared internals as a public component", () => {
    const covered = ensureComponentCoverage(
      {
        breakingChanges: [],
        changes: ["Option List now shares embedded action props."],
        migrationPrompt: null,
      },
      [
        "components/tool-ui/option-list/option-list.tsx",
        "components/tool-ui/shared/embedded-actions.ts",
      ],
    );

    expect(
      covered.changes.filter((line) => /Updated \d+ Tool UI components/i.test(line)),
    ).toHaveLength(0);
  });
});
