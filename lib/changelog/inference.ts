import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { z } from "zod";
import type { InferredReleaseNotes } from "./changelog";

const InferredReleaseNotesSchema = z.object({
  breakingChanges: z.array(z.string().min(1)).default([]),
  changes: z.array(z.string().min(1)).min(1),
  migrationPrompt: z.string().min(1).nullable(),
});

type InferReleaseNotesInput = {
  releaseDate: string;
  commitSummary: string;
  changedFiles: string[];
  changelogTemplateContext: string;
};

type CriticalMigrationEvidence = Pick<
  InferReleaseNotesInput,
  "commitSummary" | "changedFiles"
>;

const RELEASE_NOTES_SYSTEM_PROMPT =
  "You are generating release notes for a public changelog. Return strict JSON only.";

const ACTION_MODEL_BREAKING_CHANGE =
  "Tool UI action model migrated to bound compound action surfaces. Legacy inline response-action patterns were removed in favor of `LocalActions` / `DecisionActions`, and outlier components now use dedicated action configs. See [Actions](/docs/actions).";
const ACTION_MODEL_CHANGE =
  "Tool UI action model refactor: migrated components to bound compound action surfaces via `LocalActions` and `DecisionActions`. See [Actions](/docs/actions).";
const ACTION_MODEL_PROMPT_STEPS = [
  "Migrate action handling to the bound compound model using LocalActions / DecisionActions.",
  "Remove legacy inline response-action usage and adopt dedicated outlier action configs where applicable.",
  "Update tests and docs to reflect action model semantics.",
];

function extractJsonPayload(text: string): string {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in inferred changelog output.");
  }

  return text.slice(firstBrace, lastBrace + 1).trim();
}

function normalizeInferredNotes(notes: InferredReleaseNotes): InferredReleaseNotes {
  const normalizeText = (text: string): string =>
    text
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\r\n/g, "\n")
      .trim();

  const breakingChanges = notes.breakingChanges
    .map((item) => normalizeText(item))
    .filter(Boolean);
  const changes = notes.changes.map((item) => normalizeText(item)).filter(Boolean);

  const isGlobalSchemaBoundaryLine = (item: string): boolean => {
    const hasToolUiScope =
      /tool ui/i.test(item) &&
      (/component entrypoints?/i.test(item) ||
        /across all components|across tool ui components|all tool ui components|repo-wide/i.test(
          item,
        ));
    const hasSchemaBoundarySignal = /schema|entrypoint|boundary/i.test(item);
    return hasToolUiScope && hasSchemaBoundarySignal;
  };

  const dedupeSchemaScope = (items: string[]): string[] => {
    const hasGlobalSchemaBoundaryLine = items.some((item) =>
      isGlobalSchemaBoundaryLine(item),
    );

    if (!hasGlobalSchemaBoundaryLine) {
      return items;
    }

    return items.filter(
      (item) =>
        !(
          /datatable/i.test(item) &&
          /schema|entrypoint|boundary/i.test(item)
        ),
    );
  };

  const normalizedBreakingChanges = dedupeSchemaScope(breakingChanges);
  const normalizedChanges = dedupeSchemaScope(changes);
  const hasGlobalSchemaBoundaryLine =
    normalizedBreakingChanges.some((item) => isGlobalSchemaBoundaryLine(item)) ||
    normalizedChanges.some((item) => isGlobalSchemaBoundaryLine(item));

  if (normalizedChanges.length === 0) {
    throw new Error("Inferred changelog output must include at least one change.");
  }

  const migrationPrompt = notes.migrationPrompt
    ? normalizeText(notes.migrationPrompt)
    : null;
  const normalizedMigrationPrompt =
    hasGlobalSchemaBoundaryLine && migrationPrompt
      ? migrationPrompt.replace(
          /\btool ui and datatable schemas\b/gi,
          "Tool UI schemas",
        )
      : migrationPrompt;

  return {
    breakingChanges: normalizedBreakingChanges,
    changes: normalizedChanges,
    migrationPrompt:
      normalizedBreakingChanges.length > 0
        ? normalizedMigrationPrompt
        : null,
  };
}

function containsActionModelSignal(text: string): boolean {
  return /action model|localactions|decisionactions|response-action|toolui\.(localactions|decisionactions)/i.test(
    text,
  );
}

function hasActionModelEvidence(evidence: CriticalMigrationEvidence): boolean {
  if (containsActionModelSignal(evidence.commitSummary)) {
    return true;
  }

  return evidence.changedFiles.some((filePath) =>
    /components\/tool-ui\/shared\/(local-actions|decision-actions|tool-ui|tool-ui-context|schema)\.tsx?$|components\/tool-ui\/(option-list|parameter-slider|preferences-panel)\//i.test(
      filePath,
    ),
  );
}

function appendActionModelMigrationSteps(prompt: string | null): string {
  if (!prompt || prompt.trim().length === 0) {
    return [
      ACTION_MODEL_PROMPT_STEPS[0],
      "",
      "Steps:",
      `- ${ACTION_MODEL_PROMPT_STEPS[1]}`,
      `- ${ACTION_MODEL_PROMPT_STEPS[2]}`,
    ].join("\n");
  }

  if (containsActionModelSignal(prompt)) {
    return prompt;
  }

  return [
    prompt.trimEnd(),
    "",
    "Action model steps:",
    `- ${ACTION_MODEL_PROMPT_STEPS[0]}`,
    `- ${ACTION_MODEL_PROMPT_STEPS[1]}`,
    `- ${ACTION_MODEL_PROMPT_STEPS[2]}`,
  ].join("\n");
}

export function ensureCriticalMigrationCoverage(
  notes: InferredReleaseNotes,
  evidence: CriticalMigrationEvidence,
): InferredReleaseNotes {
  if (!hasActionModelEvidence(evidence)) {
    return notes;
  }

  const breakingChanges = [...notes.breakingChanges];
  const changes = [...notes.changes];

  if (!breakingChanges.some((item) => containsActionModelSignal(item))) {
    breakingChanges.push(ACTION_MODEL_BREAKING_CHANGE);
  }

  if (!changes.some((item) => containsActionModelSignal(item))) {
    changes.push(ACTION_MODEL_CHANGE);
  }

  return {
    breakingChanges,
    changes,
    migrationPrompt: appendActionModelMigrationSteps(notes.migrationPrompt),
  };
}

export function parseInferredReleaseNotes(text: string): InferredReleaseNotes {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(extractJsonPayload(text));
  } catch (error) {
    throw new Error(
      `Invalid inferred changelog payload: ${(error as Error).message}`,
    );
  }

  try {
    return normalizeInferredNotes(InferredReleaseNotesSchema.parse(parsedJson));
  } catch (error) {
    throw new Error(
      `Invalid inferred changelog payload: ${(error as Error).message}`,
    );
  }
}

function selectModel() {
  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic("claude-sonnet-4-5-20250929");
  }

  if (process.env.OPENAI_API_KEY) {
    return openai("gpt-5-nano");
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
    "Output JSON schema:",
    '{ "breakingChanges": string[], "changes": string[], "migrationPrompt": string | null }',
    "",
    "Rules:",
    "- Only include a migrationPrompt when breakingChanges is non-empty.",
    "- Keep migrationPrompt as an imperative migration checklist for coding agents.",
    "- Keep entries concise and user-facing.",
    "- Include markdown links to relevant docs routes when confidence is high (for example [Actions](/docs/actions) for action-model changes).",
    "- Do not include markdown code fences in field values.",
    "- If a change has propagated across Tool UI components, use repo-wide wording.",
    "- Avoid over-indexing on a seed component (for example DataTable) when scope is cross-component.",
    "- Mention a specific component only when evidence indicates scope is actually component-local.",
    "",
    "Scenario examples:",
    "1) Cross-component schema migration (global wording)",
    "Evidence: DataTable commit appears first, then similar schema-entrypoint changes across multiple Tool UI components.",
    "Good breakingChanges example: [\"Tool UI component entrypoints now enforce /schema boundaries across components.\"]",
    "Bad breakingChanges example: [\"DataTable moved to /schema entrypoint.\"]",
    "",
    "2) Component-local fix (specific wording)",
    "Evidence: only option-list files changed, with no matching changes in other components.",
    "Good changes example: [\"Option List receipt preset generation no longer includes onConfirm in receipt mode.\"]",
    "",
    "3) Migration prompt scope",
    "When breaking scope is global, migrationPrompt should describe repo-wide migration steps.",
    "When breaking scope is local, migrationPrompt may mention the affected component directly.",
    "",
    "Existing changelog style sample:",
    input.changelogTemplateContext,
    "",
    "Changed files:",
    input.changedFiles.map((file) => `- ${file}`).join("\n"),
    "",
    "Commit evidence:",
    input.commitSummary,
    "",
    "Return JSON only.",
  ].join("\n");
}

export async function inferReleaseNotes(
  input: InferReleaseNotesInput,
): Promise<InferredReleaseNotes> {
  const model = selectModel();

  const { text } = await generateText({
    model,
    system: RELEASE_NOTES_SYSTEM_PROMPT,
    prompt: buildInferencePrompt(input),
  });

  const parsedNotes = parseInferredReleaseNotes(text);
  return ensureCriticalMigrationCoverage(parsedNotes, {
    commitSummary: input.commitSummary,
    changedFiles: input.changedFiles,
  });
}
