import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const FILE_ASSERTIONS = [
  {
    file: "app/docs/_components/docs-nav.tsx",
    needles: ["analytics.docs.navigationClicked(", "analytics.component.viewed("],
  },
  {
    file: "app/docs/_components/docs-pager.tsx",
    needles: ["analytics.docs.navigationClicked("],
  },
  {
    file: "app/docs/_components/docs-toc.tsx",
    needles: ["analytics.docs.tocLinkClicked("],
  },
  {
    file: "app/docs/_components/copy-markdown-button.tsx",
    needles: ["analytics.code.blockCopied("],
  },
  {
    file: "app/docs/_components/component-docs-tabs.tsx",
    needles: ["analytics.component.tabSwitched("],
  },
  {
    file: "app/docs/_components/component-preview-shell.tsx",
    needles: [
      "analytics.component.tabSwitched(",
      "analytics.component.previewInteracted(",
      "analytics.code.blockCopied(",
    ],
  },
  {
    file: "app/docs/_components/header-preview-tabs.tsx",
    needles: ["analytics.component.tabSwitched("],
  },
  {
    file: "app/docs/_components/gallery-docs-link.tsx",
    needles: [
      "analytics.gallery.componentClicked(",
      "analytics.docs.navigationClicked(",
    ],
  },
] as const;

describe("docs analytics instrumentation contract", () => {
  for (const { file, needles } of FILE_ASSERTIONS) {
    test(`${file} includes analytics hooks`, () => {
      const absolutePath = path.join(process.cwd(), file);
      const content = fs.readFileSync(absolutePath, "utf8");

      for (const needle of needles) {
        expect(content).toContain(needle);
      }
    });
  }
});
