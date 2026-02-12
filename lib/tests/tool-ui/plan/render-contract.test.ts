import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Plan } from "@/components/tool-ui/plan";

describe("plan render contract", () => {
  it("renders an accessible progressbar with current completion state", () => {
    const html = renderToStaticMarkup(
      React.createElement(Plan, {
        id: "plan-render-contract",
        title: "Render Contract",
        todos: [
          { id: "todo-1", label: "First", status: "completed" as const },
          { id: "todo-2", label: "Second", status: "pending" as const },
        ],
      }),
    );

    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain('aria-valuenow="50"');
  });
});
