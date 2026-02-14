import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("component preview state reset contract", () => {
  test("resets preview state in an effect instead of mutating state during render", () => {
    const previewPath = path.join(
      process.cwd(),
      "app/docs/_components/component-preview.tsx",
    );
    const content = fs.readFileSync(previewPath, "utf8");

    expect(content).toContain("useEffect");
    expect(content).not.toContain("if (prevPresetRef.current !== currentPreset)");
  });
});
