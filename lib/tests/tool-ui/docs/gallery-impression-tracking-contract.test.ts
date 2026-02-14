import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("gallery impression tracking contract", () => {
  test("preview impressions are tracked on viewport intersection", () => {
    const analyticsPath = path.join(
      process.cwd(),
      "app/docs/_components/gallery-analytics.client.tsx",
    );
    const content = fs.readFileSync(analyticsPath, "utf8");

    expect(content).toContain("IntersectionObserver");
    expect(content).toContain("entry.isIntersecting");
    expect(content).toContain("observer.disconnect()");
    expect(content).toContain("analytics.gallery.componentPreviewed(componentId)");
  });
});
