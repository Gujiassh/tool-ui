import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("app shell server boundary contract", () => {
  test("keeps docs and builder shell server-rendered while home animation remains client-only", () => {
    const shellPath = path.join(
      process.cwd(),
      "app/components/layout/app-shell.tsx",
    );
    const animatedShellPath = path.join(
      process.cwd(),
      "app/components/layout/app-shell-animated.client.tsx",
    );
    const docsLayoutPath = path.join(process.cwd(), "app/docs/layout.tsx");
    const builderLayoutPath = path.join(process.cwd(), "app/builder/layout.tsx");
    const homePagePath = path.join(process.cwd(), "app/page.tsx");

    const shellContent = fs.readFileSync(shellPath, "utf8");
    const animatedContent = fs.readFileSync(animatedShellPath, "utf8");
    const docsLayoutContent = fs.readFileSync(docsLayoutPath, "utf8");
    const builderLayoutContent = fs.readFileSync(builderLayoutPath, "utf8");
    const homePageContent = fs.readFileSync(homePagePath, "utf8");

    expect(shellContent).not.toContain('"use client"');
    expect(animatedContent).toContain('"use client"');
    expect(docsLayoutContent).toContain('from "@/app/components/layout/app-shell"');
    expect(builderLayoutContent).toContain('from "@/app/components/layout/app-shell"');
    expect(homePageContent).toContain(
      'from "@/app/components/layout/app-shell-animated.client"',
    );
  });
});
