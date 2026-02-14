import fs from "node:fs";
import path from "node:path";

export type InferredReleaseNotes = {
  breakingChanges: string[];
  changes: string[];
  migrationPrompt: string | null;
};

type RenderReleaseSectionInput = {
  date: string;
  notes: InferredReleaseNotes;
};

type UpsertReleaseSectionInput = {
  content: string;
  date: string;
  section: string;
};

export type ChangelogValidationResult = {
  ok: boolean;
  errors: string[];
};

type SectionBounds = {
  heading: string;
  start: number;
  end: number;
};

type SubsectionBounds = {
  heading: string;
  headingEnd: number;
  end: number;
};

function normalizeItemList(items: string[]): string[] {
  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace(/\s+/g, " "));
}

function parseReleaseSectionBounds(content: string): SectionBounds[] {
  const matches = Array.from(content.matchAll(/^##\s+([^\n]+)$/gm));
  return matches.map((match, index) => ({
    heading: match[1]?.trim() ?? "",
    start: match.index ?? 0,
    end: matches[index + 1]?.index ?? content.length,
  }));
}

function parseSubsectionBounds(sectionContent: string): SubsectionBounds[] {
  const matches = Array.from(sectionContent.matchAll(/^###\s+([^\n]+)$/gm));
  return matches.map((match, index) => {
    const headingLine = match[0] ?? "";
    const start = match.index ?? 0;
    return {
      heading: match[1]?.trim() ?? "",
      headingEnd: start + headingLine.length,
      end: matches[index + 1]?.index ?? sectionContent.length,
    };
  });
}

function listToBullets(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function toCodeFence(content: string, language: string): string {
  const trimmed = content.replace(/\r\n/g, "\n").trim();
  const maxBackticks = Math.max(
    3,
    ...Array.from(trimmed.matchAll(/`+/g), (match) => match[0].length + 1),
  );
  const fence = "`".repeat(maxBackticks);
  return `${fence}${language}\n${trimmed}\n${fence}`;
}

function hasCodeFence(content: string): boolean {
  return /(^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\2(?=\n|$)/m.test(content);
}

export function createInitialChangelogContent(): string {
  return `import { DocsHeader } from "../_components/docs-header";

<DocsHeader
  title="Changelog"
  mdxPath="app/docs/changelog/content.mdx"
/>\n`;
}

export function ensureChangelogFileExists(filePath: string): void {
  if (fs.existsSync(filePath)) {
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, createInitialChangelogContent(), "utf8");
}

export function renderReleaseSection({
  date,
  notes,
}: RenderReleaseSectionInput): string {
  const breakingChanges = normalizeItemList(notes.breakingChanges);
  const changes = normalizeItemList(notes.changes);
  const migrationPrompt = notes.migrationPrompt?.trim() ?? null;

  if (changes.length === 0) {
    throw new Error("Changelog rendering requires at least one change.");
  }

  const lines: string[] = [`## ${date}`, ""];

  if (breakingChanges.length > 0) {
    lines.push("### Breaking changes", "", listToBullets(breakingChanges), "");
  }

  if (breakingChanges.length > 0 && migrationPrompt) {
    lines.push(
      "### Migration prompt",
      "",
      toCodeFence(migrationPrompt, "text"),
      "",
    );
  }

  lines.push("### Changes", "", listToBullets(changes));
  return `${lines.join("\n").trimEnd()}\n`;
}

export function upsertReleaseSection({
  content,
  date,
  section,
}: UpsertReleaseSectionInput): string {
  const normalizedSection = section.trim();
  const sections = parseReleaseSectionBounds(content);
  const heading = date.trim();

  const existing = sections.find((candidate) => candidate.heading === heading);
  if (existing) {
    const before = content.slice(0, existing.start).trimEnd();
    const after = content.slice(existing.end).replace(/^\s+/, "");
    return `${before}\n\n${normalizedSection}\n${after ? `\n${after}` : ""}`.trimEnd() + "\n";
  }

  const insertAt = sections[0]?.start ?? content.length;
  const before = content.slice(0, insertAt).trimEnd();
  const after = content.slice(insertAt).replace(/^\s+/, "");
  return `${before}\n\n${normalizedSection}\n${after ? `\n${after}` : ""}`.trimEnd() + "\n";
}

export function validateChangelogStructure(
  content: string,
): ChangelogValidationResult {
  const errors: string[] = [];
  const sections = parseReleaseSectionBounds(content);

  if (sections.length === 0) {
    errors.push("Changelog must include at least one release section (## YYYY-MM-DD).");
    return { ok: false, errors };
  }

  for (const section of sections) {
    const sectionContent = content.slice(section.start, section.end);
    const subsectionBounds = parseSubsectionBounds(sectionContent);
    const subsectionNames = subsectionBounds.map((subsection) => subsection.heading);
    const firstSubheadingMatch = sectionContent.match(/^###\s+[^\n]+$/m);

    if (!firstSubheadingMatch) {
      errors.push(`Release "${section.heading}" must include subsection headings.`);
      continue;
    }

    const headingLine = sectionContent.match(/^##\s+[^\n]+/)?.[0] ?? "";
    const introArea = sectionContent
      .slice(
        sectionContent.indexOf(headingLine) + headingLine.length,
        firstSubheadingMatch.index,
      )
      .trim();

    if (introArea.length > 0) {
      errors.push(
        `Release "${section.heading}" contains prose before the first subsection heading.`,
      );
    }

    const idxBreaking = subsectionNames.indexOf("Breaking changes");
    const idxMigration = subsectionNames.indexOf("Migration prompt");
    const idxChanges = subsectionNames.indexOf("Changes");
    const migrationPromptCount = subsectionNames.filter(
      (name) => name === "Migration prompt",
    ).length;

    if (idxChanges === -1) {
      errors.push(`Release "${section.heading}" is missing "### Changes".`);
    }

    if (idxBreaking !== -1 && idxChanges !== -1 && idxBreaking > idxChanges) {
      errors.push(
        `Release "${section.heading}" must place "### Breaking changes" before "### Changes".`,
      );
    }

    if (idxMigration !== -1 && idxChanges !== -1 && idxMigration > idxChanges) {
      errors.push(
        `Release "${section.heading}" must place "### Migration prompt" before "### Changes".`,
      );
    }

    if (idxMigration !== -1 && idxBreaking === -1) {
      errors.push(
        `Release "${section.heading}" has "### Migration prompt" but no "### Breaking changes".`,
      );
    }

    if (migrationPromptCount > 1) {
      errors.push(
        `Release "${section.heading}" contains duplicate "### Migration prompt" headings.`,
      );
    }

    if (idxMigration !== -1) {
      const migrationPromptSection = subsectionBounds.find(
        (subsection) => subsection.heading === "Migration prompt",
      );
      const migrationPromptBody = migrationPromptSection
        ? sectionContent.slice(migrationPromptSection.headingEnd, migrationPromptSection.end)
        : "";

      if (!hasCodeFence(migrationPromptBody)) {
        errors.push(
          `Release "${section.heading}" has a migration prompt but is missing a markdown code block.`,
        );
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
