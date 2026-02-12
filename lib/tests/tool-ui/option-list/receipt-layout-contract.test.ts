import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("option-list receipt layout contract", () => {
  test("adds vertical spacing around separators in receipt rows", () => {
    const sourcePath = path.resolve(
      process.cwd(),
      "components/tool-ui/option-list/option-list.tsx",
    );
    const source = fs.readFileSync(sourcePath, "utf8");

    expect(source).toContain('<Separator className="my-1.5" orientation="horizontal" />');
    expect(source).toContain('className="flex items-start gap-3 py-1"');
  });
});
