import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

function getProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), "../../../..");
}

describe("action model lint contracts", () => {
  it("registers action-model lint rules in eslint config", () => {
    const config = readFileSync(
      path.join(getProjectRoot(), "eslint.config.ts"),
      "utf8",
    );

    expect(config).toContain("tool-ui/no-embedded-response-actions");
    expect(config).toContain("tool-ui/no-add-result-in-local-actions");
    expect(config).toContain("tool-ui/decision-actions-require-envelope");
  });
});
