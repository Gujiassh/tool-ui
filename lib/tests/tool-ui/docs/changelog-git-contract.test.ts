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

  test("builds context from latest tag to HEAD", () => {
    execFileSyncMock.mockImplementation((_command, args) => {
      const gitArgs = getGitArgs(args).slice(2);

      if (gitArgs[0] === "describe") {
        return "v2026.02.12";
      }

      if (gitArgs[0] === "log") {
        return "abc1234\x1ffeat: ship changelog automation\x1fincludes scripts\x1e";
      }

      if (gitArgs[0] === "show" && gitArgs[3] === "abc1234") {
        return "components/tool-ui/plan/plan.tsx\nscripts/generate-changelog.ts\n";
      }

      throw new Error(`Unexpected git command: ${gitArgs.join(" ")}`);
    });

    const context = collectReleaseGitContext("/tmp/tool-ui");

    expect(context.lastTag).toBe("v2026.02.12");
    expect(context.range).toBe("v2026.02.12..HEAD");
    expect(context.commits).toHaveLength(1);
    expect(context.changedFiles).toEqual([
      "components/tool-ui/plan/plan.tsx",
      "scripts/generate-changelog.ts",
    ]);
  });

  test("falls back to HEAD baseline when no tags exist", () => {
    execFileSyncMock.mockImplementation((_command, args) => {
      const gitArgs = getGitArgs(args).slice(2);

      if (gitArgs[0] === "describe") {
        throw new Error("fatal: No names found, cannot describe anything.");
      }

      if (gitArgs[0] === "log" && gitArgs.includes("HEAD")) {
        return "def5678\x1ffix: option list selection constraints\x1f\x1e";
      }

      if (gitArgs[0] === "show" && gitArgs[3] === "def5678") {
        return "components/tool-ui/option-list/option-list.tsx\n";
      }

      throw new Error(`Unexpected git command: ${gitArgs.join(" ")}`);
    });

    const context = collectReleaseGitContext("/tmp/tool-ui");

    expect(context.lastTag).toBeNull();
    expect(context.range).toBe("HEAD");
    expect(context.commits).toHaveLength(1);
  });

  test("supports explicit from/to refs", () => {
    execFileSyncMock.mockImplementation((_command, args) => {
      const gitArgs = getGitArgs(args).slice(2);

      if (gitArgs[0] === "describe") {
        throw new Error("describe should not run when fromRef is provided");
      }

      if (
        gitArgs[0] === "log" &&
        gitArgs.includes("base123..target456")
      ) {
        return "fedcba9\x1ffeat: compact plan mode\x1f\x1e";
      }

      if (gitArgs[0] === "show" && gitArgs[3] === "fedcba9") {
        return "components/tool-ui/plan/plan.tsx\n";
      }

      throw new Error(`Unexpected git command: ${gitArgs.join(" ")}`);
    });

    const context = collectReleaseGitContext("/tmp/tool-ui", {
      fromRef: "base123",
      toRef: "target456",
    });

    expect(context.lastTag).toBeNull();
    expect(context.range).toBe("base123..target456");
    expect(context.commits).toHaveLength(1);
  });
});
