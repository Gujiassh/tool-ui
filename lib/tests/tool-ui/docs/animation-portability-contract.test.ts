import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { buildToolUiRegistryArtifacts } from "@/lib/registry/tool-ui-registry";

const PROJECT_ROOT = process.cwd();
const COMPONENTS_ROOT = path.join(PROJECT_ROOT, "components/tool-ui");
const SOURCE_FILE_EXTENSIONS = new Set([".ts", ".tsx"]);
const PRIVATE_ANIMATION_TOKENS = [
  "fade-blur-in",
  "fade-in-stagger",
  "fade-out-stagger",
  "fade-up",
  "spring-bounce",
  "check-draw",
  "progress-pulse",
  "glow-pulse",
  "sparkline-glint",
  "sparkline-glint-slow",
];

function listSourceFiles(rootPath: string): string[] {
  const entries = fs.readdirSync(rootPath, { withFileTypes: true });
  const sourceFiles: string[] = [];

  for (const entry of entries) {
    const absolutePath = path.join(rootPath, entry.name);

    if (entry.isDirectory()) {
      sourceFiles.push(...listSourceFiles(absolutePath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!SOURCE_FILE_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    sourceFiles.push(absolutePath);
  }

  return sourceFiles;
}

function getLineHits(content: string, token: string): number[] {
  const lines = content.split("\n");
  const hits: number[] = [];

  lines.forEach((line, index) => {
    if (line.includes(token)) {
      hits.push(index + 1);
    }
  });

  return hits;
}

describe("tool-ui animation portability contract", () => {
  const sourceFiles = listSourceFiles(COMPONENTS_ROOT);

  test("tool-ui sources do not reference private animation keyframes", () => {
    const violations: string[] = [];

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, "utf8");
      const relativePath = path.relative(PROJECT_ROOT, filePath);

      for (const token of PRIVATE_ANIMATION_TOKENS) {
        const lineHits = getLineHits(content, token);
        for (const line of lineHits) {
          violations.push(`${relativePath}:${line} -> ${token}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  test("tool-ui sources do not declare inline @keyframes", () => {
    const violations: string[] = [];

    for (const filePath of sourceFiles) {
      const content = fs.readFileSync(filePath, "utf8");
      const relativePath = path.relative(PROJECT_ROOT, filePath);
      const lineHits = getLineHits(content, "@keyframes");

      for (const line of lineHits) {
        violations.push(`${relativePath}:${line}`);
      }
    }

    expect(violations).toEqual([]);
  });

  test("registry artifacts do not embed private animation keyframes", async () => {
    const artifacts = await buildToolUiRegistryArtifacts(PROJECT_ROOT);
    const violations: string[] = [];

    for (const item of artifacts.items) {
      for (const file of item.files) {
        const content = file.content;
        if (!content) {
          continue;
        }

        for (const token of PRIVATE_ANIMATION_TOKENS) {
          if (content.includes(token)) {
            violations.push(`${item.name}:${file.path} -> ${token}`);
          }
        }

        if (content.includes("@keyframes")) {
          violations.push(`${item.name}:${file.path} -> @keyframes`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
