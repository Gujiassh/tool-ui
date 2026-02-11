import { describe, expect, test } from "vitest";

import { createPreferencesSectionSignature } from "@/components/tool-ui/preferences-panel/signature";

describe("preferences-panel section signature", () => {
  test("changes when item defaults change", () => {
    const a = createPreferencesSectionSignature([
      {
        heading: "General",
        items: [
          {
            id: "notifications",
            label: "Notifications",
            type: "switch",
            defaultChecked: false,
          },
        ],
      },
    ]);

    const b = createPreferencesSectionSignature([
      {
        heading: "General",
        items: [
          {
            id: "notifications",
            label: "Notifications",
            type: "switch",
            defaultChecked: true,
          },
        ],
      },
    ]);

    expect(a).not.toBe(b);
  });

  test("remains stable for identical sections", () => {
    const sections = [
      {
        heading: "General",
        items: [
          {
            id: "theme",
            label: "Theme",
            type: "toggle" as const,
            options: [
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ],
            defaultValue: "light",
          },
        ],
      },
    ];

    expect(createPreferencesSectionSignature(sections)).toBe(
      createPreferencesSectionSignature(sections),
    );
  });
});
