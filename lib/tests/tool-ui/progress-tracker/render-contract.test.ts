import React from "react";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProgressTracker } from "@/components/tool-ui/progress-tracker";

describe("progress tracker render contract", () => {
  it("is server-renderable (no client directive)", () => {
    const sourcePath = path.join(
      process.cwd(),
      "components/tool-ui/progress-tracker/progress-tracker.tsx",
    );
    const source = fs.readFileSync(sourcePath, "utf8");

    expect(source).not.toContain('"use client"');
  });

  it("renders semantic ordered step markup", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-semantic-list",
        steps: [
          { id: "step-1", label: "First", status: "completed" as const },
          { id: "step-2", label: "Second", status: "in-progress" as const },
        ],
      }),
    );

    expect(html).toContain("<ol");
    expect(html).toContain("First");
    expect(html).toContain("Second");
    expect(html.indexOf("First")).toBeLessThan(html.indexOf("Second"));
  });

  it("does not render action buttons in display-only v2", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-no-actions",
        steps: [
          { id: "step-1", label: "First", status: "completed" as const },
          { id: "step-2", label: "Second", status: "pending" as const },
        ],
      }),
    );

    expect(html).not.toContain("@container/actions");
    expect(html).not.toContain("<button");
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

  it("renders elapsed time using a semantic <time> with dateTime", () => {
    const html = renderToStaticMarkup(
      React.createElement(ProgressTracker, {
        id: "progress-tracker-semantic-time",
        steps: [
          { id: "step-1", label: "First", status: "completed" as const },
          { id: "step-2", label: "Second", status: "in-progress" as const },
        ],
        elapsedTime: 43200,
      }),
    );

    expect(html).toContain("<time");
    expect(html).toContain('dateTime="PT43.2S"');
    expect(html).toContain("43.2s");
  });
});
