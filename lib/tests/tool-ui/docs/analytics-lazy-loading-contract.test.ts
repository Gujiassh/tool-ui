import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

describe("analytics lazy loading contract", () => {
  test("defers third-party analytics SDK imports until runtime usage", () => {
    const analyticsPath = path.join(process.cwd(), "lib/analytics.ts");
    const posthogInitPath = path.join(
      process.cwd(),
      "app/components/analytics/posthog-init.client.tsx",
    );

    const analyticsContent = fs.readFileSync(analyticsPath, "utf8");
    const posthogInitContent = fs.readFileSync(posthogInitPath, "utf8");

    expect(analyticsContent).not.toContain('import posthog from "posthog-js"');
    expect(analyticsContent).not.toContain(
      'import { track as vercelTrack } from "@vercel/analytics"',
    );
    expect(analyticsContent).toContain('import("posthog-js")');
    expect(analyticsContent).toContain('import("@vercel/analytics")');

    expect(posthogInitContent).not.toContain('import posthog from "posthog-js"');
    expect(posthogInitContent).toContain('await import("posthog-js")');
  });
});
