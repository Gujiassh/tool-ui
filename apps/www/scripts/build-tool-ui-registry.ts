import path from "path";
import { fileURLToPath } from "url";
import { writeToolUiRegistryArtifacts } from "../lib/registry/tool-ui-registry";

async function main(): Promise<void> {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, "..");
  const artifacts = await writeToolUiRegistryArtifacts(projectRoot);

  console.log(
    `Built registry with ${artifacts.items.length} items at public/r/*.json`,
  );
}

main().catch((error: unknown) => {
  console.error("Failed to build Tool UI shadcn registry artifacts.");
  console.error(error);
  process.exitCode = 1;
});
