import { describe, expect, it } from "vitest";

import {
  parseNumericLike,
  sortData,
} from "@/components/tool-ui/data-table/utilities";

describe("data-table numeric parsing contract", () => {
  it("parses comma thousands separators as thousands, not decimals", () => {
    expect(parseNumericLike("1,234")).toBe(1234);
    expect(parseNumericLike("12,345")).toBe(12345);
  });

  it("parses dot thousands separators as thousands, not decimals", () => {
    expect(parseNumericLike("1.234")).toBe(1234);
    expect(parseNumericLike("12.345")).toBe(12345);
  });

  it("keeps decimal parsing for values that are clearly decimal", () => {
    expect(parseNumericLike("1,23")).toBe(1.23);
    expect(parseNumericLike("1.23")).toBe(1.23);
  });

  it("sorts numeric-like strings with thousands separators correctly", () => {
    const rows = [{ amount: "1,234" }, { amount: "900" }, { amount: "12,345" }];

    const asc = sortData(rows, "amount", "asc").map((r) => r.amount);
    const desc = sortData(rows, "amount", "desc").map((r) => r.amount);

    expect(asc).toEqual(["900", "1,234", "12,345"]);
    expect(desc).toEqual(["12,345", "1,234", "900"]);
  });
});
