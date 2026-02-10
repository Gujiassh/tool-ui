import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";
import { buildToolUiRegistryArtifacts } from "@/lib/registry/tool-ui-registry";

function getProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), "../../..");
}

describe("Tool UI registry artifacts", () => {
  it("builds a flat index and per-item content payloads", async () => {
    const artifacts = await buildToolUiRegistryArtifacts(getProjectRoot());
    const itemNames = artifacts.items.map((item) => item.name);

    expect(itemNames).toEqual([
      "tool-ui-shared",
      "tool-ui-plan",
      "tool-ui-progress-tracker",
      "tool-ui-option-list",
      "tool-ui-message-draft",
      "tool-ui-data-table",
    ]);

    expect(artifacts.index.items).toHaveLength(artifacts.items.length);

    for (const indexItem of artifacts.index.items) {
      for (const file of indexItem.files ?? []) {
        expect(Object.prototype.hasOwnProperty.call(file, "content")).toBe(
          false,
        );
      }
    }

    const planItem = artifacts.items.find(
      (item) => item.name === "tool-ui-plan",
    );
    expect(planItem).toBeDefined();
    expect(planItem?.files.some((file) => file.path.endsWith("plan.tsx"))).toBe(
      true,
    );
    expect(planItem?.registryDependencies).toContain(
      "https://tool-ui.com/r/tool-ui-shared.json",
    );
  });
});
