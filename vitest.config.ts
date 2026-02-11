import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  test: {
    environment: "node",
    include: ["lib/playground/**/*.test.ts", "lib/tests/**/*.test.ts"],
    setupFiles: ["lib/tests/setup/console-guard.ts"],
    passWithNoTests: true,
    globals: true,
    coverage: {
      reporter: ["text", "json-summary"],
    },
  },
});
