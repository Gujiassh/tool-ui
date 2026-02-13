import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { collectReleaseGitContext } from "@/lib/changelog/git";

vi.mock("node:child_process", () => ({
  execFileSync: vi.fn(),
}));

const execFileSyncMock = vi.mocked(execFileSync);

function getGitArgs(args: unknown): string[] {
  if (!Array.isArray(args)) {
    throw new Error("Expected git args to be an array.");
  }
  return args as string[];
}

describe("changelog git contract", () => {
  beforeEach(() => {
    execFileSyncMock.mockReset();
  });

  test("throws an actionable error when no release tags exist", () => {
    execFileSyncMock.mockImplementation((_command, args) => {
      const gitArgs = getGitArgs(args).slice(2);
      if (gitArgs[0] === "describe") {
        throw new Error("fatal: No names found, cannot describe anything.");
      }

      throw new Error(`Unexpected git command: ${gitArgs.join(" ")}`);
    });

    expect(() => collectReleaseGitContext("/tmp/tool-ui")).toThrow(
      /No git release tag found/i,
    );
  });

  test("builds context from the latest tag through HEAD", () => {
    execFileSyncMock.mockImplementation((_command, args) => {
      const gitArgs = getGitArgs(args).slice(2);

      if (gitArgs[0] === "describe") {
        return "v2026.02.12";
      }

      if (gitArgs[0] === "log") {
        return "abc1234\x1ffeat: ship changelog automation\x1fincludes scripts\x1e";
      }

      if (gitArgs[0] === "show") {
        return "scripts/generate-changelog.ts\nlib/changelog/git.ts\n";
      }

      throw new Error(`Unexpected git command: ${gitArgs.join(" ")}`);
    });

    const context = collectReleaseGitContext("/tmp/tool-ui");

    expect(context.lastTag).toBe("v2026.02.12");
    expect(context.range).toBe("v2026.02.12..HEAD");
    expect(context.commits).toHaveLength(1);
    expect(context.changedFiles).toEqual([
      "lib/changelog/git.ts",
      "scripts/generate-changelog.ts",
    ]);
  });

  test("excludes docs-site-only commits and docs paths from context", () => {
    execFileSyncMock.mockImplementation((_command, args) => {
      const gitArgs = getGitArgs(args).slice(2);

      if (gitArgs[0] === "describe") {
        return "v2026.02.12";
      }

      if (gitArgs[0] === "log") {
        return [
          "aaa1111\x1fdocs: polish actions page\x1fcopy only\x1e",
          "bbb2222\x1ffeat: harden action model\x1fcore + docs\x1e",
        ].join("");
      }

      if (gitArgs[0] === "show" && gitArgs[3] === "aaa1111") {
        return "app/docs/actions/content.mdx\ndocs/rfcs/action-model.md\n";
      }

      if (gitArgs[0] === "show" && gitArgs[3] === "bbb2222") {
        return "app/docs/actions/content.mdx\ncomponents/tool-ui/shared/schema.ts\n";
      }

      throw new Error(`Unexpected git command: ${gitArgs.join(" ")}`);
    });

    const context = collectReleaseGitContext("/tmp/tool-ui");

    expect(context.commits).toHaveLength(1);
    expect(context.commits[0]?.hash).toBe("bbb2222");
    expect(context.commits[0]?.files).toEqual([
      "components/tool-ui/shared/schema.ts",
    ]);
    expect(context.changedFiles).toEqual([
      "components/tool-ui/shared/schema.ts",
    ]);
  });

  test("throws when release range contains only docs-site changes", () => {
    execFileSyncMock.mockImplementation((_command, args) => {
      const gitArgs = getGitArgs(args).slice(2);

      if (gitArgs[0] === "describe") {
        return "v2026.02.12";
      }

      if (gitArgs[0] === "log") {
        return "ccc3333\x1fdocs: update changelog page\x1fcopy updates\x1e";
      }

      if (gitArgs[0] === "show" && gitArgs[3] === "ccc3333") {
        return "app/docs/changelog/content.mdx\ndocs/changelog-guidelines.md\n";
      }

      throw new Error(`Unexpected git command: ${gitArgs.join(" ")}`);
    });

    expect(() => collectReleaseGitContext("/tmp/tool-ui")).toThrow(
      /No non-doc commits found/i,
    );
  });
});
