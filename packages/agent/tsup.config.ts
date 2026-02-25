import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  outDir: "dist",
  outExtension: () => ({ js: ".mjs" }),
  banner: { js: "#!/usr/bin/env node" },
  clean: true,
});
