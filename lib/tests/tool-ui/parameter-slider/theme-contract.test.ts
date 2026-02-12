import fs from "node:fs";
import path from "node:path";

describe("parameter-slider theme contract", () => {
  test("does not hard-code a dark track background override", () => {
    const sourcePath = path.resolve(
      process.cwd(),
      "components/tool-ui/parameter-slider/parameter-slider.tsx",
    );
    const source = fs.readFileSync(sourcePath, "utf8");

    expect(source).not.toMatch(/\bdark:bg-black\/40\b/);
  });
});
