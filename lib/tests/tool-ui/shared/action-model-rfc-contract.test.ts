import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

function getProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), "../../../..");
}

function readWorkspaceFile(relativePath: string): string {
  return readFileSync(path.join(getProjectRoot(), relativePath), "utf8");
}

describe("action model RFC contracts", () => {
  it("uses /docs/actions in docs navigation", () => {
    const docsPages = readWorkspaceFile("app/docs/_components/docs-pages.ts");

    expect(docsPages).toContain('/docs/actions');
    expect(docsPages).not.toContain('/docs/local-actions');
    expect(docsPages).not.toContain('/docs/response-actions');
  });

  it("removes embedded response action props from migrated display components", () => {
    const displayComponentFiles = [
      "components/tool-ui/audio/audio.tsx",
      "components/tool-ui/citation/citation.tsx",
      "components/tool-ui/code-block/code-block.tsx",
      "components/tool-ui/data-table/data-table.tsx",
      "components/tool-ui/image/image.tsx",
      "components/tool-ui/instagram-post/instagram-post.tsx",
      "components/tool-ui/link-preview/link-preview.tsx",
      "components/tool-ui/linkedin-post/linkedin-post.tsx",
      "components/tool-ui/order-summary/order-summary.tsx",
      "components/tool-ui/plan/plan.tsx",
      "components/tool-ui/terminal/terminal.tsx",
      "components/tool-ui/video/video.tsx",
      "components/tool-ui/x-post/x-post.tsx",
    ];

    const forbidden = /\b(responseActions|onResponseAction|onBeforeResponseAction)\b/;

    for (const relativePath of displayComponentFiles) {
      const content = readWorkspaceFile(relativePath);
      expect(content, relativePath).not.toMatch(forbidden);
    }
  });

  it("removes embedded response action APIs from migrated display docs", () => {
    const displayDocsFiles = [
      "app/docs/audio/content.mdx",
      "app/docs/citation/content.mdx",
      "app/docs/code-block/content.mdx",
      "app/docs/data-table/content.mdx",
      "app/docs/image/content.mdx",
      "app/docs/instagram-post/content.mdx",
      "app/docs/link-preview/content.mdx",
      "app/docs/linkedin-post/content.mdx",
      "app/docs/order-summary/content.mdx",
      "app/docs/plan/content.mdx",
      "app/docs/terminal/content.mdx",
      "app/docs/video/content.mdx",
      "app/docs/x-post/content.mdx",
    ];

    const forbidden = /\b(responseActions|onResponseAction|onBeforeResponseAction)\b/;

    for (const relativePath of displayDocsFiles) {
      const content = readWorkspaceFile(relativePath);
      expect(content, relativePath).not.toMatch(forbidden);
    }
  });
});
