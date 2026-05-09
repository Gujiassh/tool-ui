"use client";

import { useAui } from "@assistant-ui/react";
import { Loader2 } from "lucide-react";
import { type FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

export const MCPModal: FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const aui = useAui();
  const [mcpUrl, setMcpUrl] = useState("");
  const [transportType, setTransportType] = useState<"http" | "sse">("http");
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTransportType(mcpUrl.toLowerCase().endsWith("/sse") ? "sse" : "http");
  }, [mcpUrl]);

  const loadTools = async () => {
    if (!mcpUrl.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/mcp-tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverUrl: mcpUrl, transportType }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch tools");
      }
      setTools(data.tools || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tools");
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateUI = (tool: MCPTool) => {
    const prompt = `Please create a Tool UI component for the following MCP tool:

**Tool Name:** ${tool.name}

**Description:** ${tool.description || "No description provided"}

**Full Schema:**
\`\`\`json
${JSON.stringify(tool.inputSchema, null, 2)}
\`\`\``;

    aui.thread().append({
      role: "user",
      content: [{ type: "text", text: prompt }],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle>Import MCP Tool</DialogTitle>
        </DialogHeader>

        <div className="mb-4 flex gap-2">
          <InputGroup className="flex-1">
            <InputGroupInput
              placeholder="Enter MCP server URL..."
              value={mcpUrl}
              onChange={(e) => setMcpUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") loadTools();
              }}
            />
            <InputGroupAddon align="inline-end" className="pr-1">
              <Select
                value={transportType}
                onValueChange={(value: "http" | "sse") =>
                  setTransportType(value)
                }
              >
                <SelectTrigger className="h-6 w-auto gap-1 border-0 bg-transparent px-2 text-xs shadow-none hover:bg-transparent focus:ring-0 data-[state=open]:bg-transparent dark:bg-transparent dark:hover:bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="sse">SSE</SelectItem>
                </SelectContent>
              </Select>
            </InputGroupAddon>
          </InputGroup>
          <Button onClick={loadTools} disabled={loading || !mcpUrl.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading
              </>
            ) : (
              "Load"
            )}
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto rounded-md border">
          {tools.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
              {loading ? "Loading tools..." : "No tools loaded"}
            </div>
          ) : (
            <div className="divide-y">
              {tools.map((tool) => (
                <div
                  key={tool.name}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="mr-4 min-w-0 flex-1">
                    <div className="font-medium text-sm">{tool.name}</div>
                    {tool.description && (
                      <div className="mt-1 truncate text-muted-foreground text-xs">
                        {tool.description}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleGenerateUI(tool)}
                    className="shrink-0"
                  >
                    Generate UI
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
