import { describe, expect, it } from "vitest";
import {
  parseSerializableTerminal,
  safeParseSerializableTerminal,
} from "@/components/tool-ui/terminal/schema";

const validPayload = {
  id: "terminal-schema-contract",
  command: "pnpm test",
  stdout: "all tests passed",
  exitCode: 0,
};

describe("terminal schema contract", () => {
  it("rejects non-integer exitCode values", () => {
    const payload = {
      ...validPayload,
      exitCode: 1.5,
    };

    expect(() => parseSerializableTerminal(payload)).toThrow();
    expect(safeParseSerializableTerminal(payload)).toBeNull();
  });

  it("rejects negative exitCode values", () => {
    const payload = {
      ...validPayload,
      exitCode: -1,
    };

    expect(() => parseSerializableTerminal(payload)).toThrow();
    expect(safeParseSerializableTerminal(payload)).toBeNull();
  });
});
