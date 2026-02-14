import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { generateObject, zodSchema } from "ai";
import { inferReleaseNotes } from "@/lib/changelog/inference";

vi.mock("ai", async () => {
  const actual = await vi.importActual<typeof import("ai")>("ai");
  return {
    ...actual,
    generateObject: vi.fn(),
  };
});

const generateObjectMock = vi.mocked(generateObject);

describe("changelog inference schema contract", () => {
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    generateObjectMock.mockReset();
    process.env.OPENAI_API_KEY = "test-key";
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalOpenAiKey;
    process.env.ANTHROPIC_API_KEY = originalAnthropicKey;
  });

  test("passes a schema where all top-level keys are required", async () => {
    generateObjectMock.mockResolvedValue({
      object: {
        breakingChanges: [],
        changes: ["Updated rendering behavior."],
        migrationPrompt: null,
      },
    } as never);

    await inferReleaseNotes({
      releaseDate: "2026-02-14",
      changedFiles: ["components/tool-ui/plan/plan.tsx"],
      commitSummary: "- abc1234 feat(plan): add compact mode",
      changelogTemplateContext: "## 2026-02-13\n\n### Changes\n\n- Example",
    });

    const payload = generateObjectMock.mock.calls[0]?.[0] as
      | { schema?: unknown }
      | undefined;
    expect(payload).toBeDefined();
    expect(payload?.schema).toBeDefined();

    const jsonSchema = zodSchema(payload!.schema as never).jsonSchema as {
      required?: string[];
    };

    expect(jsonSchema.required).toEqual([
      "breakingChanges",
      "changes",
      "migrationPrompt",
    ]);
  });
});
