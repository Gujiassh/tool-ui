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
});
