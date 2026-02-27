import * as p from "@clack/prompts";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface AgentConfig {
  agent: string;
  pluginPath: string;
}

const CONFIG_DIR = ".tool-ui";
const CONFIG_FILE = "agent.json";

function getConfigPath(): string {
  return join(process.cwd(), CONFIG_DIR, CONFIG_FILE);
}

function readConfig(): AgentConfig | null {
  const configPath = getConfigPath();
  if (!existsSync(configPath)) return null;
  try {
    return JSON.parse(readFileSync(configPath, "utf-8")) as AgentConfig;
  } catch {
    return null;
  }
}

function writeConfig(config: AgentConfig): void {
  const dir = join(process.cwd(), CONFIG_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(getConfigPath(), JSON.stringify(config, null, 2) + "\n");
}

function getPluginPath(): string {
  // In dist/, plugin is at ../plugin relative to the cli.mjs file
  // In dev (src/), plugin is at ../plugin relative to the src/ dir
  const candidates = [
    resolve(__dirname, "..", "plugin"),
    resolve(__dirname, "plugin"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return candidates[0]!;
}

async function runSetup(): Promise<AgentConfig> {
  p.intro("Tool UI Agent Setup");

  const agent = await p.select({
    message: "Which coding agent do you use?",
    options: [
      {
        value: "claude-code",
        label: "Claude Code",
        hint: "Installs a Claude Code plugin with Tool UI skills",
      },
    ],
  });

  if (p.isCancel(agent)) {
    p.cancel("Setup cancelled.");
    process.exit(0);
  }

  const pluginPath = getPluginPath();
  const config: AgentConfig = { agent: agent as string, pluginPath };

  writeConfig(config);

  p.outro("Setup complete! Run `tool-agent setup` to reconfigure.");

  return config;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args[0] === "setup") {
    await runSetup();
    return;
  }

  let config = readConfig();
  if (!config) {
    config = await runSetup();
  }

  if (args.length === 0) {
    console.error("Usage: tool-agent <prompt>");
    console.error("       tool-agent setup");
    process.exit(1);
  }

  const dry = args.includes("--dry");
  const promptArgs = args.filter((a) => a !== "--dry");
  const prompt = promptArgs.join(" ");

  if (config.agent === "claude-code") {
    const claudeArgs = ["--plugin-dir", config.pluginPath];
    if (prompt) claudeArgs.unshift(`/tool-ui ${prompt}`);
    if (dry) {
      const cmd = ["claude", ...claudeArgs];
      const escaped = cmd.map((a) => (a.includes(" ") ? `"${a}"` : a));
      console.log(escaped.join(" "));
      return;
    }

    execFileSync("claude", claudeArgs, { stdio: "inherit" });
    console.log("\nThanks for using tool-agent!");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
