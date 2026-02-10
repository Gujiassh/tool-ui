import { promises as fs } from "fs";
import path from "path";

type RegistryItemType =
  | "registry:block"
  | "registry:component"
  | "registry:lib"
  | "registry:hook"
  | "registry:ui"
  | "registry:page"
  | "registry:file"
  | "registry:style"
  | "registry:theme"
  | "registry:item";

export interface RegistryFile {
  path: string;
  type: RegistryItemType;
  target?: string;
  content?: string;
}

export interface RegistryItem {
  $schema: string;
  name: string;
  type: RegistryItemType;
  title: string;
  description: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
}

export interface RegistryIndex {
  $schema: string;
  name: string;
  homepage: string;
  items: Array<Omit<RegistryItem, "$schema"> & { files?: RegistryFile[] }>;
}

interface ToolUiRegistryDefinition {
  name: string;
  title: string;
  description: string;
  sourceDir: string;
  additionalFiles?: string[];
  dependencies?: string[];
  registryDependencies?: string[];
}

export interface ToolUiRegistryArtifacts {
  index: RegistryIndex;
  items: RegistryItem[];
}

export interface ToolUiRegistryOptions {
  registryBaseUrl?: string;
}

const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";
const REGISTRY_ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";

const TOOL_UI_REGISTRY_DEFINITIONS: ToolUiRegistryDefinition[] = [
  {
    name: "tool-ui-shared",
    title: "Tool UI Shared",
    description: "Shared helpers and schemas for Tool UI components.",
    sourceDir: "components/tool-ui/shared",
    additionalFiles: ["lib/ui/cn.ts"],
    dependencies: ["@assistant-ui/react", "lucide-react", "zod"],
    registryDependencies: ["button"],
  },
  {
    name: "tool-ui-plan",
    title: "Tool UI Plan",
    description: "Display step-by-step task workflows in AI interfaces.",
    sourceDir: "components/tool-ui/plan",
    dependencies: ["lucide-react", "zod"],
    registryDependencies: [
      "accordion",
      "button",
      "card",
      "collapsible",
      "tool-ui-shared",
    ],
  },
  {
    name: "tool-ui-progress-tracker",
    title: "Tool UI Progress Tracker",
    description:
      "Show real-time status feedback for multi-step operations in AI interfaces.",
    sourceDir: "components/tool-ui/progress-tracker",
    dependencies: ["lucide-react", "zod"],
    registryDependencies: ["button", "tool-ui-shared"],
  },
  {
    name: "tool-ui-option-list",
    title: "Tool UI Option List",
    description: "Single or multi-select choices with confirmation actions.",
    sourceDir: "components/tool-ui/option-list",
    dependencies: ["lucide-react", "zod"],
    registryDependencies: ["button", "separator", "tool-ui-shared"],
  },
  {
    name: "tool-ui-message-draft",
    title: "Tool UI Message Draft",
    description: "Review and confirm drafted messages before sending.",
    sourceDir: "components/tool-ui/message-draft",
    dependencies: ["lucide-react", "zod"],
    registryDependencies: ["button", "tool-ui-shared"],
  },
  {
    name: "tool-ui-data-table",
    title: "Tool UI Data Table",
    description: "Sortable, responsive data tables for tool call results.",
    sourceDir: "components/tool-ui/data-table",
    dependencies: ["zod"],
    registryDependencies: [
      "accordion",
      "badge",
      "button",
      "dropdown-menu",
      "table",
      "tooltip",
      "tool-ui-shared",
    ],
  },
];

function inferRegistryFileType(filePath: string): RegistryItemType {
  if (filePath.endsWith(".tsx")) return "registry:component";
  if (filePath.endsWith(".ts")) return "registry:lib";
  if (filePath.endsWith(".css")) return "registry:style";
  return "registry:file";
}

async function listFilesRecursively(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const filePaths: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      filePaths.push(...(await listFilesRecursively(entryPath)));
      continue;
    }
    if (entry.isFile()) {
      filePaths.push(entryPath);
    }
  }

  return filePaths.sort((a, b) => a.localeCompare(b));
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join(path.posix.sep);
}

async function buildRegistryItem(
  projectRoot: string,
  definition: ToolUiRegistryDefinition,
  registryBaseUrl: string,
): Promise<RegistryItem> {
  const absoluteSourceDir = path.join(projectRoot, definition.sourceDir);
  const absoluteFilePaths = await listFilesRecursively(absoluteSourceDir);
  const absoluteAdditionalFilePaths = (definition.additionalFiles ?? []).map(
    (filePath) => path.join(projectRoot, filePath),
  );
  const allAbsoluteFilePaths = [
    ...absoluteFilePaths,
    ...absoluteAdditionalFilePaths,
  ].sort((a, b) => a.localeCompare(b));

  const files = await Promise.all(
    allAbsoluteFilePaths.map(async (absolutePath): Promise<RegistryFile> => {
      const relativePath = toPosixPath(
        path.relative(projectRoot, absolutePath),
      );
      const content = await fs.readFile(absolutePath, "utf8");
      return {
        path: relativePath,
        type: inferRegistryFileType(relativePath),
        target: relativePath,
        content,
      };
    }),
  );

  const registryDependencies = definition.registryDependencies?.map(
    (dependency) =>
      dependency === "tool-ui-shared"
        ? `${registryBaseUrl}/tool-ui-shared.json`
        : dependency,
  );

  return {
    $schema: REGISTRY_ITEM_SCHEMA,
    name: definition.name,
    type: "registry:block",
    title: definition.title,
    description: definition.description,
    dependencies: definition.dependencies,
    registryDependencies,
    files,
  };
}

function toIndexItem(item: RegistryItem): RegistryIndex["items"][number] {
  return {
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files: item.files.map(({ path: filePath, type, target }) => ({
      path: filePath,
      type,
      ...(target ? { target } : {}),
    })),
  };
}

export async function buildToolUiRegistryArtifacts(
  projectRoot: string,
  options: ToolUiRegistryOptions = {},
): Promise<ToolUiRegistryArtifacts> {
  const registryBaseUrl =
    options.registryBaseUrl?.replace(/\/$/, "") ?? "https://tool-ui.com/r";

  const items = await Promise.all(
    TOOL_UI_REGISTRY_DEFINITIONS.map((definition) =>
      buildRegistryItem(projectRoot, definition, registryBaseUrl),
    ),
  );

  const index: RegistryIndex = {
    $schema: REGISTRY_SCHEMA,
    name: "tool-ui",
    homepage: "https://tool-ui.com",
    items: items.map(toIndexItem),
  };

  return {
    index,
    items,
  };
}

export async function writeToolUiRegistryArtifacts(
  projectRoot: string,
  options: ToolUiRegistryOptions = {},
): Promise<ToolUiRegistryArtifacts> {
  const artifacts = await buildToolUiRegistryArtifacts(projectRoot, options);
  const outputDir = path.join(projectRoot, "public", "r");
  await fs.mkdir(outputDir, { recursive: true });

  await fs.writeFile(
    path.join(outputDir, "registry.json"),
    `${JSON.stringify(artifacts.index, null, 2)}\n`,
    "utf8",
  );

  await Promise.all(
    artifacts.items.map((item) =>
      fs.writeFile(
        path.join(outputDir, `${item.name}.json`),
        `${JSON.stringify(item, null, 2)}\n`,
        "utf8",
      ),
    ),
  );

  return artifacts;
}
