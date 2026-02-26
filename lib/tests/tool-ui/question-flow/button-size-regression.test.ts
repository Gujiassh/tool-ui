// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, test, vi } from "vitest";

import { QuestionFlow } from "@/components/tool-ui/question-flow";

describe("QuestionFlow button size regression", () => {
  test("renders the primary Next button at default button size", () => {
    render(
      createElement(QuestionFlow, {
        id: "question-flow-next-size",
        step: 1,
        title: "Choose a category",
        options: [
          { id: "analytics", label: "Analytics" },
          { id: "monitoring", label: "Monitoring" },
        ],
      }),
    );

    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton.getAttribute("data-size")).toBe("default");
  });

  test("renders the Back button at default button size when available", () => {
    render(
      createElement(QuestionFlow, {
        id: "question-flow-back-size",
        step: 2,
        title: "Choose a category",
        options: [{ id: "analytics", label: "Analytics" }],
        onBack: vi.fn(),
      }),
    );

    const backButton = screen.getByRole("button", { name: "Back" });
    expect(backButton.getAttribute("data-size")).toBe("default");
  });
});
