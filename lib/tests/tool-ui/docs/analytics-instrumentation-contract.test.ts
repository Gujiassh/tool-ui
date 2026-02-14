import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const FILE_ASSERTIONS = [
  {
    file: "app/docs/_components/docs-nav.tsx",
    needles: [
      "analytics.docs.navigationClicked(",
      "analytics.component.viewed(",
    ],
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
    file: "app/docs/_components/tracked-dynamic-codeblock.tsx",
    needles: [
      "analytics.code.blockCopied(",
      "analytics.docs.installSnippetCopied(",
    ],
  },
  {
    file: "mdx-components.tsx",
    needles: ["TrackedDynamicCodeBlock"],
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
  {
    file: "app/docs/_components/gallery-analytics.client.tsx",
    needles: [
      "analytics.gallery.pageViewed(",
      "analytics.gallery.componentPreviewed(",
    ],
  },
  {
    file: "app/docs/_components/docs-search.client.tsx",
    needles: [
      "analytics.search.opened(",
      "analytics.search.querySubmitted(",
      "analytics.search.noResults(",
      "analytics.search.resultClicked(",
    ],
  },
  {
    file: "app/components/home/home-hero.tsx",
    needles: ["analytics.cta.clicked("],
  },
  {
    file: "app/components/layout/tracked-external-anchor.client.tsx",
    needles: ["analytics.external.linkClicked("],
  },
  {
    file: "app/components/layout/app-header.server.tsx",
    needles: ["TrackedExternalAnchor"],
  },
  {
    file: "app/components/layout/mobile-nav-sheet.client.tsx",
    needles: ["TrackedExternalAnchor"],
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
