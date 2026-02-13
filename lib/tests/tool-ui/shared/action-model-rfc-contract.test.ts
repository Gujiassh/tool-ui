import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { describe, expect, it } from "vitest";

const FORBIDDEN_EMBEDDED_ACTION_IDENTIFIERS =
  /\b(responseActions|onResponseAction|onBeforeResponseAction)\b/;
const FORBIDDEN_LEGACY_ACTION_PHRASE = /\bresponse actions?\b/i;

function getProjectRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), "../../../..");
}

function readWorkspaceFile(relativePath: string): string {
  return readFileSync(path.join(getProjectRoot(), relativePath), "utf8");
}

function expectFilesNotToMatch(relativePaths: string[], pattern: RegExp) {
  for (const relativePath of relativePaths) {
    const content = readWorkspaceFile(relativePath);
    expect(content, relativePath).not.toMatch(pattern);
  }
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

    expectFilesNotToMatch(
      displayComponentFiles,
      FORBIDDEN_EMBEDDED_ACTION_IDENTIFIERS,
    );
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

    expectFilesNotToMatch(
      displayDocsFiles,
      FORBIDDEN_EMBEDDED_ACTION_IDENTIFIERS,
    );
  });

  it("keeps legacy action doc routes as redirects to /docs/actions", () => {
    const legacyRoutePages = [
      "app/docs/local-actions/page.tsx",
      "app/docs/response-actions/page.tsx",
    ];

    for (const relativePath of legacyRoutePages) {
      const content = readWorkspaceFile(relativePath);
      expect(content, relativePath).toContain('redirect("/docs/actions")');
    }
  });

  it("keeps legacy action doc content as deprecation stubs", () => {
    const legacyContentFiles = [
      "app/docs/local-actions/content.mdx",
      "app/docs/response-actions/content.mdx",
    ];

    for (const relativePath of legacyContentFiles) {
      const content = readWorkspaceFile(relativePath);
      expect(content, relativePath).toContain("deprecated");
      expect(content, relativePath).toContain("/docs/actions");
      expect(content, relativePath).not.toContain("<ToolUI");
      expect(content, relativePath).not.toContain("Local Action Example");
      expect(content, relativePath).not.toContain("Decision Action Example");
    }
  });

  it("removes legacy response action terminology from maintainer docs and comments", () => {
    const maintainerDocsAndComments = [
      "README.md",
      "CLAUDE.md",
      "app/docs/actions/content.mdx",
      "app/docs/local-actions/content.mdx",
      "app/docs/response-actions/content.mdx",
      "components/tool-ui/data-table/schema.ts",
      "lib/playground/prototypes/waymo/wip-tool-uis/ux.md",
    ];

    expectFilesNotToMatch(
      maintainerDocsAndComments,
      FORBIDDEN_LEGACY_ACTION_PHRASE,
    );
  });
});
