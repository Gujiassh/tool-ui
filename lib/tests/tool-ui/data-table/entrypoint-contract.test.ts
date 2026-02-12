import { describe, expect, it } from "vitest";

import * as DataTableUi from "@/components/tool-ui/data-table";
import * as DataTableSchema from "@/components/tool-ui/data-table/schema";

describe("data-table entrypoint contract", () => {
  it("keeps schema helpers off the main UI entrypoint", () => {
    expect(DataTableUi).not.toHaveProperty("parseSerializableDataTable");
    expect(DataTableUi).not.toHaveProperty("safeParseSerializableDataTable");
    expect(DataTableUi).not.toHaveProperty("SerializableDataTableSchema");
  });

  it("exposes schema helpers from the /schema entrypoint", () => {
    expect(DataTableSchema).toHaveProperty("parseSerializableDataTable");
    expect(DataTableSchema).toHaveProperty("safeParseSerializableDataTable");
    expect(DataTableSchema).toHaveProperty("SerializableDataTableSchema");
  });
});
