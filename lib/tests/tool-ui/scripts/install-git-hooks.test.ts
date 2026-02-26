import { describe, expect, test, vi } from "vitest";
import { configureGitHooks } from "@/scripts/install-git-hooks";

describe("install git hooks", () => {
  test("skips configuration when not inside a git work tree", () => {
    const runCommand =
      vi.fn<(command: string, args: string[]) => number | null>();
    runCommand.mockReturnValueOnce(1);

    const status = configureGitHooks(runCommand);

    expect(status).toBe("skipped");
    expect(runCommand).toHaveBeenCalledTimes(1);
    expect(runCommand).toHaveBeenCalledWith("git", [
      "rev-parse",
      "--is-inside-work-tree",
    ]);
  });

  test("configures the repository hooks path to .githooks", () => {
    const runCommand =
      vi.fn<(command: string, args: string[]) => number | null>();
    runCommand.mockReturnValueOnce(0).mockReturnValueOnce(0);

    const status = configureGitHooks(runCommand);

    expect(status).toBe("configured");
    expect(runCommand).toHaveBeenNthCalledWith(1, "git", [
      "rev-parse",
      "--is-inside-work-tree",
    ]);
    expect(runCommand).toHaveBeenNthCalledWith(2, "git", [
      "config",
      "--local",
      "core.hooksPath",
      ".githooks",
    ]);
  });

  test("returns failed when git config cannot set hooksPath", () => {
    const runCommand =
      vi.fn<(command: string, args: string[]) => number | null>();
    runCommand.mockReturnValueOnce(0).mockReturnValueOnce(1);

    const status = configureGitHooks(runCommand);

    expect(status).toBe("failed");
  });
});
