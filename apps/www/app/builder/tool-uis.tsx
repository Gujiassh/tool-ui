"use client";

import { makeAssistantTool, makeAssistantToolUI } from "@assistant-ui/react";
import { FileEdit, FileText, PencilIcon } from "lucide-react";
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { triggerPreviewRefresh } from "./preview-refresh";

export const EditFileToolUI = makeAssistantTool<
  {
    path?: string;
    edits?: Array<{ oldText?: string; newText?: string }>;
  },
  {}
>({
  type: "backend",
  toolName: "edit_file",
  streamCall: async (reader) => {
    await reader.response.get();
    triggerPreviewRefresh();
  },
  render: ({ args }) => {
    const path = args?.path;
    const edits = args?.edits;

    if (!path && (!edits || edits.length === 0)) {
      return null;
    }

    return (
      <Card className="mb-4 w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PencilIcon className="text-primary h-4 w-4" />
            <CardTitle className="text-base">Editing File</CardTitle>
          </div>
          {path && (
            <CardDescription className="mt-1 font-mono text-xs">
              {path}
            </CardDescription>
          )}
        </CardHeader>
        {edits && edits.length > 0 && (
          <CardContent>
            <div className="grid gap-2">
              {edits.map(
                (edit, index) =>
                  (edit.oldText || edit.newText) && (
                    <CodeBlock
                      key={index}
                      className="grid overflow-scroll py-2"
                    >
                      {edit.oldText && (
                        <>
                          <CodeBlockCode
                            code={edit.oldText
                              .split("\n")
                              .slice(0, 5)
                              .join("\n")}
                            language="tsx"
                            className="col-start-1 col-end-1 row-start-1 row-end-1 overflow-visible bg-red-200 [&_code]:bg-red-200 [&>pre]:py-0"
                          />
                          {edit.oldText.split("\n").length > 5 && (
                            <div className="px-4 font-mono text-xs text-red-700">
                              +{edit.oldText.split("\n").length - 5} more
                            </div>
                          )}
                        </>
                      )}
                      {edit.newText && (
                        <>
                          <CodeBlockCode
                            code={edit.newText
                              .trimEnd()
                              .split("\n")
                              .slice(0, 5)
                              .join("\n")}
                            language="tsx"
                            className="col-start-1 col-end-1 row-start-1 row-end-1 overflow-visible bg-green-200 [&_code]:bg-green-200 [&>pre]:py-0"
                          />
                          {edit.newText.split("\n").length > 5 && (
                            <div className="px-4 font-mono text-xs text-green-700">
                              +{edit.newText.split("\n").length - 5} more
                            </div>
                          )}
                        </>
                      )}
                    </CodeBlock>
                  ),
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  },
});

export const WriteFileToolUI = makeAssistantTool<
  { path?: string; content?: string },
  {}
>({
  type: "backend",
  toolName: "write_file",
  streamCall: async (reader) => {
    await reader.response.get();
    triggerPreviewRefresh();
  },
  render: ({ args }) => {
    const path = args?.path;
    if (!path) return null;
    return (
      <Card className="mb-4 w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileEdit className="text-primary h-4 w-4" />
            <CardTitle className="text-base">Writing File</CardTitle>
          </div>
          <CardDescription className="mt-1 font-mono text-xs">
            {path}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  },
});

export const ReadFileToolUI = makeAssistantToolUI<{ path?: string }, {}>({
  toolName: "read_file",
  render: ({ args }) => {
    const path = args?.path;
    if (!path) return null;
    return (
      <Card className="mb-4 w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="text-primary h-4 w-4" />
            <CardTitle className="text-base">Reading File</CardTitle>
          </div>
          <CardDescription className="mt-1 font-mono text-xs">
            {path}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  },
});
