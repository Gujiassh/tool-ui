import { describe, expect, test } from "vitest";
import {
  detectInstallSnippetType,
  getDocsCodeCopySource,
} from "@/lib/docs/install-snippet-analytics";

describe("install snippet analytics helpers", () => {
  test("detects skills install commands", () => {
    const snippet =
      "npx skills add https://github.com/assistant-ui/tool-ui --skill tool-ui";
    expect(detectInstallSnippetType(snippet)).toBe("skills");
  });

  test("detects shadcn registry install commands", () => {
    const snippet = "npx shadcn@latest add https://tool-ui.com/r/plan.json";
    expect(detectInstallSnippetType(snippet)).toBe("registry");
  });

  test("detects package-manager install commands", () => {
    const snippet = "pnpm add @assistant-ui/react";
    expect(detectInstallSnippetType(snippet)).toBe("package_manager");
  });

  test("returns null for non-install snippets", () => {
    const snippet = "const x = 1;";
    expect(detectInstallSnippetType(snippet)).toBeNull();
  });

  test("maps install snippets to install copy source", () => {
    expect(getDocsCodeCopySource("skills")).toBe("docs_installation");
    expect(getDocsCodeCopySource(null)).toBe("docs_code_block");
  });
});
