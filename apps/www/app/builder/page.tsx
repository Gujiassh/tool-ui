"use client";

import { useEffect, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { Check, Code, Copy, Eye, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block";
import { ThreadList } from "@/app/components/assistant-ui/thread-list";
import WebView from "@/app/components/builder/webview";
import { getComponentCode } from "@/lib/integrations/freestyle/get-code";
import { PreviewRefreshContext, PreviewRefreshSetter } from "./preview-refresh";
import { Thread } from "./thread";
import { EditFileToolUI, ReadFileToolUI, WriteFileToolUI } from "./tool-uis";

type ViewMode = "rendered" | "code";

export default function BuilderPage() {
  const [repoId, setRepoId] = useState<string | null>(null);
  const repoIdRef = useState({ current: repoId })[0];
  const [_appId, setAppId] = useState<string | null>(null);
  const [webviewWidth, setWebviewWidth] = useState(50);
  const [viewMode, setViewMode] = useState<ViewMode>("rendered");
  const [codeContent, setCodeContent] = useState<string | null>(null);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const timestampRef = useState(() => Date.now())[0];

  repoIdRef.current = repoId;

  useEffect(() => {
    if (viewMode === "code" && repoId && !codeContent) {
      setIsCodeLoading(true);
      getComponentCode(repoId, "components/demo-tool-ui.tsx")
        .then((content) => {
          setCodeContent(content);
          setIsCodeLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load code:", err);
          setIsCodeLoading(false);
        });
    }
  }, [viewMode, repoId, codeContent]);

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/builder/chat",
      headers: async () => {
        if (
          !repoIdRef.current &&
          process.env.NEXT_PUBLIC_FREESTYLE_ENABLED !== "false"
        ) {
          try {
            const response = await fetch("/api/builder/create-freestyle", {
              method: "POST",
            });
            if (response.ok) {
              const data = await response.json();
              setRepoId(data.repoId);
              repoIdRef.current = data.repoId;
              setAppId(data.repoId + "-" + timestampRef);
            }
          } catch (error) {
            console.error("Failed to create Freestyle project:", error);
          }
        }
        return { "Repo-Id": repoIdRef.current || "" };
      },
    }),
  });

  const handleCopy = async () => {
    if (!codeContent) return;
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = webviewWidth;
    const containerWidth = window.innerWidth - 240;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = startX - e.clientX;
      const percentageChange = (diff / containerWidth) * 100;
      const newWidth = Math.min(
        Math.max(startWidth + percentageChange, 20),
        80,
      );
      setWebviewWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleRefreshPreview = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <PreviewRefreshContext.Provider value={handleRefreshPreview}>
      <AssistantRuntimeProvider runtime={runtime}>
        <PreviewRefreshSetter />
        <div className="flex h-full flex-1 flex-col md:flex-row">
          <div className="bg-background hidden w-[220px] shrink-0 overflow-y-auto p-4 md:block">
            <ThreadList />
          </div>

          <div
            className="overflow-hidden border md:rounded-t-lg"
            style={{ width: repoId ? `${100 - webviewWidth}%` : "100%" }}
          >
            <Thread />
          </div>

          {repoId && (
            <>
              <div
                role="separator"
                className="bg-border hover:bg-primary hidden w-1 cursor-col-resize transition-colors md:block"
                onMouseDown={handleMouseDown}
              />

              <div
                className="flex flex-col"
                style={{ width: `${webviewWidth}%` }}
              >
                <div className="bg-background flex h-12 shrink-0 items-center justify-between border-t border-b px-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "rendered" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("rendered")}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">Preview</span>
                    </Button>
                    <Button
                      variant={viewMode === "code" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("code")}
                      className="gap-2"
                    >
                      <Code className="h-4 w-4" />
                      <span className="hidden sm:inline">Code</span>
                    </Button>
                  </div>
                  {viewMode === "rendered" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRefreshKey((prev) => prev + 1)}
                      title="Refresh preview"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      disabled={!codeContent || isCodeLoading}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  {viewMode === "rendered" ? (
                    <WebView key={refreshKey} repo={repoId} />
                  ) : (
                    <div className="h-full overflow-auto p-4">
                      {isCodeLoading ? (
                        <div className="flex h-full items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                            <p className="text-muted-foreground mt-4 text-sm">
                              Loading code...
                            </p>
                          </div>
                        </div>
                      ) : codeContent ? (
                        <CodeBlock>
                          <CodeBlockCode code={codeContent} language="tsx" />
                        </CodeBlock>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <p className="text-muted-foreground text-sm">
                            Failed to load code
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <EditFileToolUI />
        <WriteFileToolUI />
        <ReadFileToolUI />
      </AssistantRuntimeProvider>
    </PreviewRefreshContext.Provider>
  );
}
