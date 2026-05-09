"use client";

import type { Toolkit } from "@assistant-ui/react";
import { ToolFallback } from "@/app/components/assistant-ui/tool-fallback";
import { DataTable } from "@/components/tool-ui/data-table";
import { safeParseSerializableDataTable } from "@/components/tool-ui/data-table/schema";
import { Plan } from "@/components/tool-ui/plan";
import { safeParseSerializablePlan } from "@/components/tool-ui/plan/schema";
import { ToolUI } from "@/components/tool-ui/shared";
import { StatsDisplay } from "@/components/tool-ui/stats-display";
import { safeParseSerializableStatsDisplay } from "@/components/tool-ui/stats-display/schema";
import { Terminal } from "@/components/tool-ui/terminal";
import { safeParseSerializableTerminal } from "@/components/tool-ui/terminal/schema";

export const DEMO_CHAT_TOOLKIT: Toolkit = {
  show_plan: {
    type: "backend",
    render: ({ result }) => {
      const parsed = safeParseSerializablePlan(result);
      if (!parsed) return null;
      return (
        <ToolUI id={parsed.id}>
          <ToolUI.Surface>
            <Plan {...parsed} />
          </ToolUI.Surface>
          <ToolUI.Actions>
            <ToolUI.LocalActions
              actions={[
                { id: "approve", label: "Looks good" },
                { id: "revise", label: "Request changes", variant: "outline" },
              ]}
              onAction={() => {}}
            />
          </ToolUI.Actions>
        </ToolUI>
      );
    },
  },
  get_tasks: {
    type: "backend",
    render: ({ result }) => {
      const parsed = safeParseSerializableDataTable(result);
      if (!parsed) return null;
      return (
        <div className="not-prose">
          <DataTable.Table
            id={parsed.id}
            rowIdKey={parsed.rowIdKey ?? "id"}
            columns={parsed.columns}
            data={parsed.data}
            defaultSort={parsed.defaultSort}
          />
        </div>
      );
    },
  },
  show_stats: {
    type: "backend",
    render: ({ result }) => {
      const parsed = safeParseSerializableStatsDisplay(result);
      if (!parsed) return null;
      return <StatsDisplay {...parsed} />;
    },
  },
  show_terminal: {
    type: "backend",
    render: ({ result }) => {
      const parsed = safeParseSerializableTerminal(result);
      if (!parsed) return null;
      return <Terminal {...parsed} />;
    },
  },
};

export const DEMO_CHAT_TOOL_FALLBACK = ToolFallback;
