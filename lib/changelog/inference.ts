import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import type { InferredReleaseNotes } from "./changelog";

const InferredReleaseNotesSchema = z.object({
  breakingChanges: z.array(z.string().min(1)).default([]),
  changes: z.array(z.string().min(1)).min(1),
  migrationPrompt: z.string().min(1).nullable().default(null),
});

type InferReleaseNotesInput = {
  releaseDate: string;
  commitSummary: string;
  changedFiles: string[];
  changelogTemplateContext: string;
};

const RELEASE_NOTES_SYSTEM_PROMPT = [
  "You write changelog entries for a public component library.",
  "Be precise and concise.",
  "Only claim what is directly supported by commit evidence.",
].join(" ");

function normalizeText(text: string): string {
  return text
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\r\n/g, "\n")
    .trim();
}

export function sanitizeInferredReleaseNotes(
  notes: InferredReleaseNotes,
): InferredReleaseNotes {
  const breakingChanges = notes.breakingChanges
    .map((item) => normalizeText(item))
    .filter(Boolean);
  const changes = notes.changes.map((item) => normalizeText(item)).filter(Boolean);

  if (changes.length === 0) {
    throw new Error("Inferred changelog output must include at least one change.");
  }

  const migrationPrompt = notes.migrationPrompt
    ? normalizeText(notes.migrationPrompt)
    : null;

  return {
    breakingChanges,
    changes,
    migrationPrompt: breakingChanges.length > 0 ? migrationPrompt : null,
  };
}

function selectModel() {
  if (process.env.OPENAI_API_KEY) {
    return openai(process.env.CHANGELOG_OPENAI_MODEL ?? "gpt-5");
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic(
      process.env.CHANGELOG_ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929",
    );
  }

  throw new Error(
    "Missing model credentials. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.",
  );
}

export function buildInferencePrompt(input: InferReleaseNotesInput): string {
  return [
    "Infer release notes from commit evidence.",
    `Release date: ${input.releaseDate}`,
    "",
    "Output fields:",
    '- breakingChanges: list of user-visible breaking changes (empty list if none).',
    '- changes: list of user-visible non-breaking changes.',
    "- migrationPrompt: migration checklist text, or null when there are no breaking changes.",
    "",
    "Writing rules:",
    "- Use clear user-facing language.",
    "- Keep each bullet compact (roughly one sentence).",
    "- Do not invent details not present in evidence.",
    "- Keep migrationPrompt as plain text (no markdown fences).",
    "",
    "Existing changelog style sample:",
    input.changelogTemplateContext,
    "",
    "Changed files:",
    input.changedFiles.map((file) => `- ${file}`).join("\n"),
    "",
    "Commit evidence:",
    input.commitSummary,
  ].join("\n");
}

export async function inferReleaseNotes(
  input: InferReleaseNotesInput,
): Promise<InferredReleaseNotes> {
  const model = selectModel();
  const { object } = await generateObject({
    model,
    schema: InferredReleaseNotesSchema,
    system: RELEASE_NOTES_SYSTEM_PROMPT,
    prompt: buildInferencePrompt(input),
  });

  return sanitizeInferredReleaseNotes(object);
}
