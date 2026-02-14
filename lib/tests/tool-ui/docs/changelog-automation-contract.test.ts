import { describe, expect, test } from "vitest";
import {
  renderReleaseSection,
  upsertReleaseSection,
  validateChangelogStructure,
} from "@/lib/changelog/changelog";

describe("changelog automation contract", () => {
  test("renders migration prompt for breaking releases", () => {
    const section = renderReleaseSection({
      date: "2026-02-12",
      notes: {
        breakingChanges: ["Schema exports moved to dedicated entrypoints."],
        changes: ["Updated components to use new schema boundaries."],
        migrationPrompt: "Update schema imports and regenerate artifacts.",
      },
    });

    expect(section).toContain("## 2026-02-12");
    expect(section).toContain("### Breaking changes");
    expect(section).toContain("### Migration prompt");
    expect(section).toContain("```text");
    expect(section).toContain("### Changes");
  });

  test("omits migration prompt for non-breaking releases", () => {
    const section = renderReleaseSection({
      date: "2026-02-12",
      notes: {
        breakingChanges: [],
        changes: ["Improved option-list rendering."],
        migrationPrompt: "This should be ignored",
      },
    });

    expect(section).not.toContain("### Breaking changes");
    expect(section).not.toContain("### Migration prompt");
    expect(section).toContain("### Changes");
  });

  test("upserts a release section by date", () => {
    const existing = `import { DocsHeader } from "../_components/docs-header";

<DocsHeader title="Changelog" mdxPath="app/docs/changelog/content.mdx" />

## 2026-02-12

### Changes

- Old change

## 2026-02-11

### Changes

- Prior release change
`;

    const replacement = `## 2026-02-12

### Changes

- New change`;

    const next = upsertReleaseSection({
      content: existing,
      date: "2026-02-12",
      section: replacement,
    });

    expect(next).toContain("- New change");
    expect(next).not.toContain("- Old change");
    expect(next.match(/^## 2026-02-12$/gm)?.length ?? 0).toBe(1);
  });

  test("fails validation when migration prompt appears without breaking changes", () => {
    const content = `## 2026-02-12

### Migration prompt

\`\`\`text
Do something
\`\`\`

### Changes

- One`;

    const result = validateChangelogStructure(content);

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toContain(
      'has "### Migration prompt" but no "### Breaking changes"',
    );
  });
});
