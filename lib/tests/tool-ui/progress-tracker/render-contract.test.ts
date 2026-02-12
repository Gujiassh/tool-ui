import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProgressTracker } from "@/components/tool-ui/progress-tracker";

describe("progress tracker render contract", () => {
  it("renders custom actions when all steps are completed", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-completed-actions",
        steps: [
          { id: "step-1", label: "First", status: "completed" as const },
          { id: "step-2", label: "Second", status: "completed" as const },
        ],
        responseActions: [{ id: "retry", label: "Retry", variant: "default" }],
      }),
    );

    expect(html).toContain("Retry");
  });

  it("does not render default cancel action when all steps are completed", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-completed-default-actions",
        steps: [
          { id: "step-1", label: "First", status: "completed" as const },
          { id: "step-2", label: "Second", status: "completed" as const },
        ],
      }),
    );

    expect(html).not.toContain(">Cancel<");
  });

  it("marks the failed step as current when no step is in progress", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-failed-current-step",
        steps: [
          { id: "connect", label: "Connect", status: "completed" as const },
          {
            id: "migrate",
            label: "Run Migrations",
            status: "failed" as const,
            description: "Failed migration",
          },
          { id: "verify", label: "Verify", status: "pending" as const },
        ],
      }),
    );

    const currentStepMatches = Array.from(
      html.matchAll(/<li[^>]*aria-current="step"[^>]*>[\s\S]*?<\/li>/g),
    );

    expect(currentStepMatches).toHaveLength(1);
    expect(currentStepMatches[0]?.[0]).toContain("Run Migrations");
  });

  it("keeps failed step descriptions visible in interactive mode", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-failed-description",
        steps: [
          { id: "connect", label: "Connect", status: "completed" as const },
          {
            id: "migrate",
            label: "Run Migrations",
            status: "failed" as const,
            description: "Failed migration",
          },
        ],
      }),
    );

    expect(html).toContain("grid-rows-[1fr] opacity-100");
    expect(html).toContain("Failed migration");
  });
});
