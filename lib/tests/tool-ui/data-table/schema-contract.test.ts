import { describe, expect, it } from "vitest";

import {
  parseSerializableDataTable,
  safeParseSerializableDataTable,
} from "@/components/tool-ui/data-table/schema";

describe("data-table schema contract", () => {
  it("parses and preserves optional serializable props", () => {
    const payload = {
      id: "data-table-schema-contract",
      columns: [{ key: "id", label: "ID" }],
      data: [{ id: "r-1" }],
      rowIdKey: "id",
      defaultSort: { by: "id", direction: "desc" as const },
      sort: { by: "id", direction: "asc" as const },
      emptyMessage: "Nothing here",
      maxHeight: "320px",
      locale: "de-DE",
    };

    const parsed = parseSerializableDataTable(payload);
    expect(parsed).toMatchObject(payload);

    const safeParsed = safeParseSerializableDataTable(payload);
    expect(safeParsed).toMatchObject(payload);
  });
});
