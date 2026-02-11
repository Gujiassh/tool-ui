import { describe, expect, it } from "vitest";
import { resolveTabFromSearchParam } from "@/hooks/use-tab-search-param";

describe("use-tab-search-param contracts", () => {
  it("resolves raw tab when present in current valid tabs", () => {
    const tab = resolveTabFromSearchParam("examples", "overview", [
      "overview",
      "examples",
    ]);
    expect(tab).toBe("examples");
  });

  it("falls back to default when raw tab is invalid", () => {
    const tab = resolveTabFromSearchParam("examples", "overview", ["overview"]);
    expect(tab).toBe("overview");
  });

  it("accepts tabs that become valid after caller updates validTabs", () => {
    const first = resolveTabFromSearchParam("examples", "overview", [
      "overview",
    ]);
    const second = resolveTabFromSearchParam("examples", "overview", [
      "overview",
      "examples",
    ]);

    expect(first).toBe("overview");
    expect(second).toBe("examples");
  });
});
