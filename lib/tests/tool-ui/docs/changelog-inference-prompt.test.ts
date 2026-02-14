import { describe, expect, test } from "vitest";
import { buildInferencePrompt } from "@/lib/changelog/inference";

describe("changelog inference prompt", () => {
  test("includes date, changed files, and commit evidence", () => {
    const prompt = buildInferencePrompt({
      releaseDate: "2026-02-12",
      changedFiles: [
        "components/tool-ui/plan/plan.tsx",
        "components/tool-ui/plan/schema.ts",
      ],
      commitSummary: "- abc1234 feat(plan): add compact mode",
      changelogTemplateContext: "## 2026-02-11\n\n### Changes\n\n- Example",
    });

    expect(prompt).toContain("Release date: 2026-02-12");
    expect(prompt).toContain("Changed files:");
    expect(prompt).toContain("- components/tool-ui/plan/plan.tsx");
    expect(prompt).toContain("Commit evidence:");
    expect(prompt).toContain("- abc1234 feat(plan): add compact mode");
    expect(prompt).toContain(
      "If commit evidence shows a major architectural or cross-component system refactor, include one explicit bullet that names that refactor and its scope.",
    );
  });
});
