import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("action-centric unified props contracts", () => {
  it("uses unified actions terminology across action-centric docs", () => {
    const docsFiles = [
      "app/docs/actions/content.mdx",
      "app/docs/option-list/content.mdx",
      "app/docs/parameter-slider/content.mdx",
      "app/docs/preferences-panel/content.mdx",
    ];

    for (const file of docsFiles) {
      const content = read(file);
      expect(content, file).toContain("actions");
      expect(content, file).not.toContain("selectionActions");
      expect(content, file).not.toContain("adjustmentActions");
      expect(content, file).not.toContain("formActions");
      expect(content, file).not.toContain("onSelectionAction");
      expect(content, file).not.toContain("onAdjustmentAction");
      expect(content, file).not.toContain("onFormAction");
      expect(content, file).not.toContain("onBeforeSelectionAction");
      expect(content, file).not.toContain("onBeforeAdjustmentAction");
      expect(content, file).not.toContain("onBeforeFormAction");
    }
  });

  it("removes legacy and semantic action callback props from public action-centric schemas", () => {
    const schemaFiles = [
      "components/tool-ui/option-list/schema.ts",
      "components/tool-ui/parameter-slider/schema.ts",
      "components/tool-ui/preferences-panel/schema.ts",
    ];

    for (const file of schemaFiles) {
      const content = read(file);
      expect(content, file).toContain("actions?: ActionsProp");
      expect(content, file).toContain("onAction?:");
      expect(content, file).toContain("onBeforeAction?:");
      expect(content, file).not.toContain("selectionActions?:");
      expect(content, file).not.toContain("adjustmentActions?:");
      expect(content, file).not.toContain("formActions?:");
      expect(content, file).not.toContain("onSelectionAction?:");
      expect(content, file).not.toContain("onAdjustmentAction?:");
      expect(content, file).not.toContain("onFormAction?:");
      expect(content, file).not.toContain("onBeforeSelectionAction?:");
      expect(content, file).not.toContain("onBeforeAdjustmentAction?:");
      expect(content, file).not.toContain("onBeforeFormAction?:");
      expect(content, file).not.toContain("onConfirm?:");
      expect(content, file).not.toContain("onSave?:");
      expect(content, file).not.toContain("onCancel?:");
    }
  });
});
