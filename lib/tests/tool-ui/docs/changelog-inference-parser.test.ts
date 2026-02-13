import { describe, expect, test } from "vitest";
import {
  ensureCriticalMigrationCoverage,
  parseInferredReleaseNotes,
} from "@/lib/changelog/inference";

describe("changelog inference parser", () => {
  test("parses fenced JSON output", () => {
    const output = [
      "Here is the inferred changelog payload:",
      "```json",
      '{ "breakingChanges": ["A"], "changes": ["B"], "migrationPrompt": "C" }',
      "```",
    ].join("\n");

    const parsed = parseInferredReleaseNotes(output);
    expect(parsed.breakingChanges).toEqual(["A"]);
    expect(parsed.changes).toEqual(["B"]);
    expect(parsed.migrationPrompt).toBe("C");
  });

  test("forces null migration prompt for non-breaking output", () => {
    const output = JSON.stringify({
      breakingChanges: [],
      changes: ["B"],
      migrationPrompt: "Should be ignored",
    });

    const parsed = parseInferredReleaseNotes(output);
    expect(parsed.breakingChanges).toEqual([]);
    expect(parsed.changes).toEqual(["B"]);
    expect(parsed.migrationPrompt).toBeNull();
  });

  test("throws when JSON payload is missing required fields", () => {
    const output = JSON.stringify({
      changes: [],
    });

    expect(() => parseInferredReleaseNotes(output)).toThrow(
      "Invalid inferred changelog payload",
    );
  });

  test("normalizes literal newline escapes in migration prompts", () => {
    const output = JSON.stringify({
      breakingChanges: ["A"],
      changes: ["B"],
      migrationPrompt: "Line 1\\nLine 2\\n\\nLine 3",
    });

    const parsed = parseInferredReleaseNotes(output);
    expect(parsed.migrationPrompt).toBe("Line 1\nLine 2\n\nLine 3");
  });

  test("drops component-specific schema lines when a global boundary line exists", () => {
    const output = JSON.stringify({
      breakingChanges: [
        "DataTable schema helpers moved to a dedicated /schema entrypoint.",
        "Tool UI component entrypoints now enforce a /schema boundary across all components.",
      ],
      changes: [
        "Split DataTable schema helpers into /schema entrypoint and updated contracts.",
        "Migrated schema helper exports to /schema entrypoints across Tool UI components.",
      ],
      migrationPrompt:
        "Migrate codebase to adopt explicit /schema entrypoints for Tool UI and DataTable schemas.",
    });

    const parsed = parseInferredReleaseNotes(output);
    expect(parsed.breakingChanges).toEqual([
      "Tool UI component entrypoints now enforce a /schema boundary across all components.",
    ]);
    expect(parsed.changes).toEqual([
      "Migrated schema helper exports to /schema entrypoints across Tool UI components.",
    ]);
    expect(parsed.migrationPrompt).toBe(
      "Migrate codebase to adopt explicit /schema entrypoints for Tool UI schemas.",
    );
  });

  test("detects global schema scope from varied phrasing", () => {
    const output = JSON.stringify({
      breakingChanges: [
        "Tool UI: enforced /schema boundaries on component entrypoints repo-wide.",
      ],
      changes: [
        "Tool UI: enforced /schema boundaries on component entrypoints repo-wide.",
        "DataTable: moved schema helpers to dedicated /schema entrypoint.",
      ],
      migrationPrompt:
        "Migrate codebase to adopt explicit /schema entrypoints for Tool UI and DataTable schemas.",
    });

    const parsed = parseInferredReleaseNotes(output);
    expect(parsed.breakingChanges).toEqual([
      "Tool UI: enforced /schema boundaries on component entrypoints repo-wide.",
    ]);
    expect(parsed.changes).toEqual([
      "Tool UI: enforced /schema boundaries on component entrypoints repo-wide.",
    ]);
    expect(parsed.migrationPrompt).toBe(
      "Migrate codebase to adopt explicit /schema entrypoints for Tool UI schemas.",
    );
  });

  test("adds action-model migration coverage when action-model signals are present", () => {
    const covered = ensureCriticalMigrationCoverage(
      {
        breakingChanges: [
          "Tool UI component entrypoints now enforce /schema boundaries.",
        ],
        changes: ["Tool UI: repo-wide enforcement of /schema entrypoints."],
        migrationPrompt:
          "Migrate codebase to adopt explicit /schema entrypoints for Tool UI schemas.",
      },
      {
        changedFiles: [
          "components/tool-ui/shared/local-actions.tsx",
          "components/tool-ui/shared/decision-actions.tsx",
        ],
        commitSummary: "- abc1234 feat: action model cutover",
      },
    );

    expect(covered.breakingChanges.join("\n")).toContain("LocalActions");
    expect(covered.changes.join("\n")).toContain("DecisionActions");
    expect(covered.migrationPrompt).toContain(
      "Migrate action handling to the bound compound model using LocalActions / DecisionActions.",
    );
  });

  test("does not add action-model migration coverage without action-model signals", () => {
    const source = {
      breakingChanges: [
        "Tool UI component entrypoints now enforce /schema boundaries.",
      ],
      changes: ["Tool UI: repo-wide enforcement of /schema entrypoints."],
      migrationPrompt:
        "Migrate codebase to adopt explicit /schema entrypoints for Tool UI schemas.",
    };

    const covered = ensureCriticalMigrationCoverage(source, {
      changedFiles: ["components/tool-ui/data-table/schema.ts"],
      commitSummary: "- def5678 feat: schema boundary hardening",
    });

    expect(covered).toEqual(source);
  });
});
