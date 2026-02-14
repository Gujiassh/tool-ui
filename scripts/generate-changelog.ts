import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ensureChangelogFileExists,
  renderReleaseSection,
  upsertReleaseSection,
  validateChangelogStructure,
} from "../lib/changelog/changelog";
import { collectReleaseGitContext, formatCommitSummary } from "../lib/changelog/git";
import { inferReleaseNotes } from "../lib/changelog/inference";

function resolveArgValue(argv: string[], prefix: string): string | undefined {
  const arg = argv.find((value) => value.startsWith(prefix));
  if (!arg) {
    return undefined;
  }

  const value = arg.slice(prefix.length).trim();
  return value.length > 0 ? value : undefined;
}

function resolveReleaseDate(argv: string[]): string {
  const date = resolveArgValue(argv, "--date=") ?? process.env.CHANGELOG_DATE;
  if (!date) {
    return new Date().toISOString().slice(0, 10);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(
      `Invalid date "${date}". Use YYYY-MM-DD (example: --date=2026-02-12).`,
    );
  }

  return date;
}

function summarizeChangelogStyle(content: string): string {
  const lines = content
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => !line.startsWith("import "));
  return lines.slice(0, 120).join("\n");
}

async function main(): Promise<void> {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, "..");
  const changelogPath = path.join(projectRoot, "app/docs/changelog/content.mdx");
  const argv = process.argv.slice(2);
  const releaseDate = resolveReleaseDate(argv);
  const fromRef = resolveArgValue(argv, "--from=");
  const toRef = resolveArgValue(argv, "--to=") ?? "HEAD";

  ensureChangelogFileExists(changelogPath);

  const currentContent = fs.readFileSync(changelogPath, "utf8");
  const gitContext = collectReleaseGitContext(projectRoot, {
    fromRef,
    toRef,
  });
  const commitSummary = formatCommitSummary(gitContext);

  const notes = await inferReleaseNotes({
    releaseDate,
    commitSummary,
    changedFiles: gitContext.changedFiles,
    changelogTemplateContext: summarizeChangelogStyle(currentContent),
  });

  const section = renderReleaseSection({
    date: releaseDate,
    notes,
  });

  const nextContent = upsertReleaseSection({
    content: currentContent,
    date: releaseDate,
    section,
  });

  const validation = validateChangelogStructure(nextContent);
  if (!validation.ok) {
    throw new Error(
      [
        "Generated changelog failed structural validation:",
        ...validation.errors.map((error) => `- ${error}`),
      ].join("\n"),
    );
  }

  fs.writeFileSync(changelogPath, nextContent, "utf8");

  console.log("Generated changelog section.");
  console.log(`- date: ${releaseDate}`);
  console.log(`- range: ${gitContext.range}`);
  console.log(`- lastTag: ${gitContext.lastTag ?? "none"}`);
  console.log(`- changelog: ${path.relative(projectRoot, changelogPath)}`);
}

main().catch((error: unknown) => {
  console.error("Failed to generate changelog.");
  console.error(error);
  process.exitCode = 1;
});
