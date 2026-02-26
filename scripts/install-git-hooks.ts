import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

type RunCommand = (command: string, args: string[]) => number | null;

function run(command: string, args: string[]): number | null {
  const result = spawnSync(command, args, { stdio: "ignore" });
  if (result.error) {
    return null;
  }
  return result.status;
}

export function configureGitHooks(
  runCommand: RunCommand = run,
): "configured" | "failed" | "skipped" {
  const insideWorkTree = runCommand("git", [
    "rev-parse",
    "--is-inside-work-tree",
  ]);
  if (insideWorkTree !== 0) {
    return "skipped";
  }

  const configured = runCommand("git", [
    "config",
    "--local",
    "core.hooksPath",
    ".githooks",
  ]);
  if (configured !== 0) {
    return "failed";
  }

  return "configured";
}

function main(): void {
  const status = configureGitHooks();
  if (status === "configured") {
    console.log('Configured git hooks path to ".githooks".');
  }
}

const entryScript = process.argv[1];
if (entryScript && import.meta.url === pathToFileURL(entryScript).href) {
  main();
}
