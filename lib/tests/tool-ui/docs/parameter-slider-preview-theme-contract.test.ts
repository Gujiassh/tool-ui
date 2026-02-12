import fs from "node:fs";
import path from "node:path";

describe("parameter-slider docs preview theme contract", () => {
  test("audio-eq preview does not force a dark track in light mode", () => {
    const sourcePath = path.resolve(
      process.cwd(),
      "lib/docs/preview-config.tsx",
    );
    const source = fs.readFileSync(sourcePath, "utf8");

    expect(source).not.toMatch(
      /trackClassName:\s*"bg-zinc-900\/80\s+dark:bg-zinc-950\/90"/,
    );
  });
});
