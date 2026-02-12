import { describe, expect, test } from "vitest";
import {
  parseSerializableOptionList,
  safeParseSerializableOptionList,
  type SerializableOptionList,
} from "@/components/tool-ui/option-list/schema";

function makePayload(): SerializableOptionList {
  return {
    id: "option-list-schema-contract",
    options: [
      { id: "alpha", label: "Alpha" },
      { id: "beta", label: "Beta" },
      { id: "gamma", label: "Gamma" },
    ],
    selectionMode: "multi",
    minSelections: 1,
    maxSelections: 2,
  };
}

describe("option-list schema contract", () => {
  test("rejects minSelections greater than maxSelections", () => {
    const payload = {
      ...makePayload(),
      minSelections: 3,
      maxSelections: 2,
    };

    expect(() => parseSerializableOptionList(payload)).toThrow();
    expect(safeParseSerializableOptionList(payload)).toBeNull();
  });

  test("rejects duplicate option ids", () => {
    const payload = makePayload();
    payload.options = [
      payload.options[0],
      { id: "alpha", label: "Duplicate Alpha" },
    ];

    expect(() => parseSerializableOptionList(payload)).toThrow();
    expect(safeParseSerializableOptionList(payload)).toBeNull();
  });

  test("rejects choice ids that are not present in options", () => {
    const payload = {
      ...makePayload(),
      choice: ["alpha", "unknown"],
    };

    expect(() => parseSerializableOptionList(payload)).toThrow();
    expect(safeParseSerializableOptionList(payload)).toBeNull();
  });

  test("rejects defaultValue ids that are not present in options", () => {
    const payload = {
      ...makePayload(),
      defaultValue: ["beta", "missing"],
    };

    expect(() => parseSerializableOptionList(payload)).toThrow();
    expect(safeParseSerializableOptionList(payload)).toBeNull();
  });
});
