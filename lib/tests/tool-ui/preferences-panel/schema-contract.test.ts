import { describe, expect, test } from "vitest";
import {
  parseSerializablePreferencesPanel,
  safeParseSerializablePreferencesPanel,
  type SerializablePreferencesPanel,
} from "@/components/tool-ui/preferences-panel/schema";

function makePayload(): SerializablePreferencesPanel {
  return {
    id: "preferences-panel-schema-contract",
    sections: [
      {
        items: [
          {
            id: "notifications",
            label: "Notifications",
            description: "Receive updates",
            type: "switch",
            defaultChecked: true,
          },
        ],
      },
    ],
  };
}

describe("preferences-panel schema contract", () => {
  test("accepts unified actions payload key", () => {
    const payload = {
      ...makePayload(),
      actions: [{ id: "save", label: "Save" }],
    };

    expect(() => parseSerializablePreferencesPanel(payload)).not.toThrow();
  });

  test("rejects legacy formActions payload key", () => {
    const payload = {
      ...makePayload(),
      formActions: [{ id: "save", label: "Save" }],
    };

    expect(() => parseSerializablePreferencesPanel(payload)).toThrow();
    expect(safeParseSerializablePreferencesPanel(payload)).toBeNull();
  });
});
