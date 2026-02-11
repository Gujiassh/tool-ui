import { describe, expect, it } from "vitest";
import {
  createDataTableRowKeys,
  getDataTableMobileDescriptionId,
} from "@/components/tool-ui/data-table/utilities";

describe("data-table row key contracts", () => {
  it("keeps keys stable for the same rows when order changes", () => {
    const rows = [
      { name: "Alpha", score: 10 },
      { name: "Beta", score: 20 },
      { name: "Gamma", score: 30 },
    ];

    const keysA = createDataTableRowKeys(rows);
    const keysB = createDataTableRowKeys([rows[2], rows[0], rows[1]]);

    const byNameA = new Map(rows.map((row, index) => [row.name, keysA[index]]));
    const byNameB = new Map([
      [rows[2].name, keysB[0]],
      [rows[0].name, keysB[1]],
      [rows[1].name, keysB[2]],
    ]);

    expect(byNameB.get("Alpha")).toBe(byNameA.get("Alpha"));
    expect(byNameB.get("Beta")).toBe(byNameA.get("Beta"));
    expect(byNameB.get("Gamma")).toBe(byNameA.get("Gamma"));
  });

  it("disambiguates duplicate identifier values", () => {
    const rows = [
      { id: "same", label: "A" },
      { id: "same", label: "B" },
    ];

    const keys = createDataTableRowKeys(rows, "id");

    expect(keys[0]).not.toBe(keys[1]);
  });

  it("creates per-instance mobile description ids", () => {
    expect(getDataTableMobileDescriptionId("orders")).toBe(
      "orders-mobile-table-description",
    );
  });

  it("sanitizes per-instance mobile description ids", () => {
    expect(getDataTableMobileDescriptionId("orders 2026/q1")).toBe(
      "orders_202026_2Fq1-mobile-table-description",
    );
  });
});
