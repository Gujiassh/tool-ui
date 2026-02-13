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
        return "components/tool-ui/plan/plan.tsx\nlib/changelog/git.ts\n";
      }

      throw new Error(`Unexpected git command: ${gitArgs.join(" ")}`);
    });

    const context = collectReleaseGitContext("/tmp/tool-ui");

    expect(context.lastTag).toBe("v2026.02.12");
    expect(context.range).toBe("v2026.02.12..HEAD");
    expect(context.commits).toHaveLength(1);
    expect(context.changedFiles).toEqual([
      "components/tool-ui/plan/plan.tsx",
    ]);
  });

  test("excludes docs-site and non-component paths from context", () => {
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

    expect(() => collectReleaseGitContext("/tmp/tool-ui")).toThrow(/No tool-ui component commits found/i);
  });

  test("supports an explicit fromRef baseline without requiring tags", () => {
    execFileSyncMock.mockImplementation((_command, args) => {
      const gitArgs = getGitArgs(args).slice(2);

      if (gitArgs[0] === "log" && gitArgs.includes("abc1234..HEAD")) {
        return "def5678\x1ffeat: ship manual changelog mode\x1fadds fromRef support\x1e";
      }

      if (gitArgs[0] === "show" && gitArgs[3] === "def5678") {
        return "components/tool-ui/image-gallery/image-gallery.tsx\nscripts/generate-changelog.ts\n";
      }

      if (gitArgs[0] === "describe") {
        throw new Error("describe should not be called when fromRef is provided");
      }

      throw new Error(`Unexpected git command: ${gitArgs.join(" ")}`);
    });

    const context = collectReleaseGitContext("/tmp/tool-ui", {
      fromRef: "abc1234",
    });

    expect(context.lastTag).toBeNull();
    expect(context.range).toBe("abc1234..HEAD");
    expect(context.commits).toHaveLength(1);
    expect(context.changedFiles).toEqual([
      "components/tool-ui/image-gallery/image-gallery.tsx",
    ]);
  });

  test("supports baseline from last changelog file commit", () => {
    execFileSyncMock.mockImplementation((_command, args) => {
      const gitArgs = getGitArgs(args).slice(2);

      if (
        gitArgs[0] === "log" &&
        gitArgs[1] === "-n" &&
        gitArgs[2] === "1" &&
        gitArgs.includes("app/docs/changelog/content.mdx")
      ) {
        return "changelog123";
      }

      if (gitArgs[0] === "log" && gitArgs.includes("changelog123..HEAD")) {
        return "run9999\x1ffeat: add runtime action guard\x1fcore safety\x1e";
      }

      if (gitArgs[0] === "show" && gitArgs[3] === "run9999") {
        return "components/tool-ui/shared/actions.ts\n";
      }

      if (gitArgs[0] === "describe") {
        throw new Error("describe should not be called in changelog-file mode");
      }

      throw new Error(`Unexpected git command: ${gitArgs.join(" ")}`);
    });

    const context = collectReleaseGitContext("/tmp/tool-ui", {
      fromChangelogPath: "app/docs/changelog/content.mdx",
    });

    expect(context.lastTag).toBeNull();
    expect(context.range).toBe("changelog123..HEAD");
    expect(context.commits).toHaveLength(1);
    expect(context.changedFiles).toEqual([
      "components/tool-ui/shared/actions.ts",
    ]);
  });

  test("supports baseline from release date when marker is missing", () => {
    execFileSyncMock.mockImplementation((_command, args) => {
      const gitArgs = getGitArgs(args).slice(2);

      if (
        gitArgs[0] === "rev-list" &&
        gitArgs.includes("--before=2026-02-12T23:59:59")
      ) {
        return "datebase123";
      }

      if (gitArgs[0] === "log" && gitArgs.includes("datebase123..HEAD")) {
        return "ship1234\x1ffeat: ship user-facing fix\x1fincludes tests\x1e";
      }

      if (gitArgs[0] === "show" && gitArgs[3] === "ship1234") {
        return "components/tool-ui/weather-widget/weather-widget.tsx\n";
      }

      if (gitArgs[0] === "describe") {
        throw new Error("describe should not be called when fromDate is provided");
      }

      throw new Error(`Unexpected git command: ${gitArgs.join(" ")}`);
    });

    const context = collectReleaseGitContext("/tmp/tool-ui", {
      fromDate: "2026-02-12",
    });

    expect(context.lastTag).toBeNull();
    expect(context.range).toBe("datebase123..HEAD");
    expect(context.commits).toHaveLength(1);
    expect(context.changedFiles).toEqual([
      "components/tool-ui/weather-widget/weather-widget.tsx",
    ]);
  });

  test("throws when multiple baseline selectors are provided", () => {
    expect(() =>
      collectReleaseGitContext("/tmp/tool-ui", {
        fromRef: "abc1234",
        fromDate: "2026-02-12",
      }),
    ).toThrow(/Provide only one baseline selector/i);
  });

  test("excludes website and changelog-tooling commits even when non-doc", () => {
    execFileSyncMock.mockImplementation((_command, args) => {
      const gitArgs = getGitArgs(args).slice(2);

      if (gitArgs[0] === "describe") {
        return "v2026.02.12";
      }

      if (gitArgs[0] === "log") {
        return [
          "aaa1111\x1ffix: landing nav flash\x1fwebsite shell\x1e",
          "bbb2222\x1fchore: changelog tooling tweak\x1finternal only\x1e",
          "ccc3333\x1ffeat: polish weather widget behavior\x1fcomponent visible\x1e",
        ].join("");
      }

      if (gitArgs[0] === "show" && gitArgs[3] === "aaa1111") {
        return "app/components/layout/app-shell.tsx\n";
      }

      if (gitArgs[0] === "show" && gitArgs[3] === "bbb2222") {
        return "scripts/generate-changelog.ts\nlib/changelog/git.ts\n";
      }

      if (gitArgs[0] === "show" && gitArgs[3] === "ccc3333") {
        return "components/tool-ui/weather-widget/weather-widget.tsx\n";
      }

      throw new Error(`Unexpected git command: ${gitArgs.join(" ")}`);
    });

    const context = collectReleaseGitContext("/tmp/tool-ui");

    expect(context.commits).toHaveLength(1);
    expect(context.commits[0]?.hash).toBe("ccc3333");
    expect(context.changedFiles).toEqual([
      "components/tool-ui/weather-widget/weather-widget.tsx",
    ]);
  });
});
