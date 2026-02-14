import { spawnSync } from "node:child_process";

function run(command: string, args: string[]): number | null {
  const result = spawnSync(command, args, { stdio: "ignore" });
  if (result.error) {
    return null;
  }
  return result.status;
}

function main(): void {
  const insideWorkTree = run("git", ["rev-parse", "--is-inside-work-tree"]);
  if (insideWorkTree !== 0) {
    return;
  }

  const configured = run("git", ["config", "core.hooksPath", ".githooks"]);
  if (configured === 0) {
    console.log('Configured git hooks path to ".githooks".');
  }
}

main();
