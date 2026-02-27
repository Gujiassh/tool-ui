import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, tool } from "ai";
import { z } from "zod";
import { checkRateLimit } from "@/lib/integrations/rate-limit/upstash";
import { getMockTasks } from "@/lib/mocks/tasks";
import { STATS_DISPLAY_DATA } from "@/lib/mocks/chat-showcase-data";

export const runtime = "edge";

const DEMO_SYSTEM_PROMPT = `You are a helpful assistant that showcases the power of Tool UI—a copy-paste component library for AI assistant interfaces.

Your role is to demonstrate how AI assistants can render rich, interactive UIs in chat. Use the available tools proactively and enthusiastically when they fit the user's request.

## Tools and when to use them

- **show_plan**: Present a step-by-step plan for multi-step tasks. Use when the user asks for a plan, workflow, checklist, deployment steps, research approach, or "how do I" questions that break down into phases.
- **get_tasks**: Retrieve and display support tickets or task lists. Use when the user asks about tickets, tasks, support queue, what's open, or wants to see a table of work items.
- **show_stats**: Display key metrics and KPIs. Use when the user asks about performance, revenue, dashboards, quarterly numbers, or business metrics.
- **show_terminal**: Show command-line output (test results, logs, build output). Use when the user asks to run tests, show terminal output, execute a command, or see build/log output.

## Guidelines

- Be concise and friendly. Add a short preamble before or after tool output—don't repeat what the UI already shows.
- When using show_plan, create relevant, varied plans (e.g. "Deploy to production", "Research competitors", "Plan a trip").
- When using get_tasks, the tool returns a support ticket queue. Present it naturally—"Here are the open tickets" or "Current support queue:".
- When using show_stats, the tool returns Q4 metrics. Present it as a quick summary.
- When using show_terminal, create realistic output for commands like "pnpm test", "npm run build", or "git status".
- If the user's request doesn't clearly match a tool, still try to pick the most relevant one to showcase it.
- Keep responses brief—let the Tool UI components do the visual heavy lifting.`;

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const rateLimitResult = await checkRateLimit(ip);

    if (!rateLimitResult.success) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
          reset: rateLimitResult.reset,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        },
      );
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: modelMessages,
      system: DEMO_SYSTEM_PROMPT,
      tools: {
        show_plan: tool({
          description:
            "Present a step-by-step plan for the user to follow. Use for workflows, checklists, deployment steps, research plans, or any multi-phase task.",
          inputSchema: z.object({
            title: z.string().describe("Short title for the plan"),
            description: z.string().optional().describe("Context or goal"),
            todos: z
              .array(
                z.object({
                  id: z.string(),
                  label: z.string(),
                  status: z
                    .enum(["pending", "in_progress", "completed", "cancelled"])
                    .default("pending"),
                  description: z.string().optional(),
                }),
              )
              .min(1)
              .describe("Steps in order"),
          }),
          execute: async ({ title, description, todos }) => {
            return {
              id: `plan-${Date.now()}`,
              title,
              description: description ?? title,
              todos: todos.map((t) => ({
                ...t,
                status: t.status ?? "pending",
              })),
            };
          },
        }),
        get_tasks: tool({
          description:
            "Retrieve the support ticket queue and display it in a sortable table. Use when the user asks about tickets, tasks, support queue, or open work.",
          inputSchema: z.object({
            assignee: z
              .string()
              .optional()
              .describe('Filter by assignee name (e.g. "Chen", "Patel")'),
          }),
          execute: async ({ assignee }) => {
            const tasks = await getMockTasks({ assignee });
            const rank = { high: 1, medium: 2, low: 3 } as const;
            const sorted = [...tasks].sort((a, b) => {
              const byUrgency = rank[a.priority] - rank[b.priority];
              if (byUrgency !== 0) return byUrgency;
              return (
                new Date(b.created).getTime() - new Date(a.created).getTime()
              );
            });

            const columns = [
              {
                key: "priority",
                label: "Urgency",
                format: {
                  kind: "status" as const,
                  statusMap: {
                    high: { tone: "danger" as const, label: "High" },
                    medium: { tone: "warning" as const, label: "Medium" },
                    low: { tone: "neutral" as const, label: "Low" },
                  },
                },
              },
              {
                key: "issue",
                label: "Issue",
                truncate: true,
                priority: "primary" as const,
              },
              {
                key: "customer",
                label: "Customer",
                priority: "primary" as const,
              },
              {
                key: "status",
                label: "Status",
                format: {
                  kind: "badge" as const,
                  colorMap: {
                    open: "info",
                    "in-progress": "warning",
                    waiting: "neutral",
                    done: "success",
                  },
                },
              },
              { key: "assignee", label: "Owner" },
              {
                key: "created",
                label: "Created",
                format: {
                  kind: "date" as const,
                  dateFormat: "relative" as const,
                },
                hideOnMobile: true,
              },
            ];

            const data = sorted.map((t) => ({
              id: t.id,
              issue: t.issue,
              customer: t.customer,
              priority: t.priority,
              status: t.status,
              assignee: t.assignee,
              created: t.created,
              urgencyOrder:
                t.priority === "high" ? 1 : t.priority === "medium" ? 2 : 3,
            }));

            return {
              id: `tasks-${Date.now()}`,
              columns,
              data,
              rowIdKey: "id",
              defaultSort: { by: "urgencyOrder", direction: "asc" as const },
            };
          },
        }),
        show_stats: tool({
          description:
            "Display key metrics and KPIs in a visual stats grid. Use when the user asks about performance, revenue, dashboards, quarterly numbers, or business metrics.",
          inputSchema: z.object({}),
          execute: async () => {
            return {
              id: `stats-${Date.now()}`,
              ...STATS_DISPLAY_DATA,
            };
          },
        }),
        show_terminal: tool({
          description:
            "Show command-line output (test results, logs, build output). Use when the user asks to run tests, execute a command, show terminal output, or see build/log results.",
          inputSchema: z.object({
            command: z.string().describe("The command that was run"),
            stdout: z.string().describe("The terminal output"),
            exitCode: z.number().describe("Exit code (0 = success)"),
            durationMs: z.number().optional().describe("Execution time in ms"),
          }),
          execute: async ({ command, stdout, exitCode, durationMs }) => {
            return {
              id: `terminal-${Date.now()}`,
              command,
              stdout,
              exitCode,
              durationMs,
            };
          },
        }),
      },
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error in chat API route:", error);
    return new Response(
      JSON.stringify({
        error: "An error occurred while processing your request.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
