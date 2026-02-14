import { describe, expect, test } from "vitest";
import {
  parseSerializableCodeBlock,
  safeParseSerializableCodeBlock,
  type SerializableCodeBlock,
} from "@/components/tool-ui/code-block/schema";

function makePayload(): SerializableCodeBlock {
  return {
    id: "code-block-schema-contract",
    code: "console.log('ok')",
    language: "typescript",
    lineNumbers: "visible",
  };
}

describe("code-block schema contract", () => {
  test("rejects unknown lineNumbers mode", () => {
    const payload = {
      ...makePayload(),
      lineNumbers: "always" as "visible",
    };

    expect(() => parseSerializableCodeBlock(payload)).toThrow();
    expect(safeParseSerializableCodeBlock(payload)).toBeNull();
  });

  test("rejects blank language values", () => {
    const payload = {
      ...makePayload(),
      language: "   ",
    };

    expect(() => parseSerializableCodeBlock(payload)).toThrow();
    expect(safeParseSerializableCodeBlock(payload)).toBeNull();
  });

  test("rejects non-positive and non-integer highlighted lines", () => {
    const payload = {
      ...makePayload(),
      highlightLines: [1, 0, 2.5, -4],
    };

    expect(() => parseSerializableCodeBlock(payload)).toThrow();
    expect(safeParseSerializableCodeBlock(payload)).toBeNull();
  });
});
