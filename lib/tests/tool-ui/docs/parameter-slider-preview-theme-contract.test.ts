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

  test("audio-eq preview uses default slider track styling", () => {
    const sourcePath = path.resolve(
      process.cwd(),
      "lib/docs/preview-config.tsx",
    );
    const source = fs.readFileSync(sourcePath, "utf8");
    const sectionMatch = source.match(/"parameter-slider":\s*\{[\s\S]*?\n\s*\},\n\s*plan:/);

    expect(sectionMatch?.[0]).toBeTruthy();
    expect(sectionMatch?.[0]).not.toMatch(/\btrackClassName:\s*"/);
  });
});
