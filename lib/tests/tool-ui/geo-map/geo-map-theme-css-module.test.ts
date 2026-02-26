// @vitest-environment jsdom

import { describe, expect, test } from "vitest";
import styles from "@/components/tool-ui/geo-map/geo-map-theme.module.css";

describe("GeoMap theme CSS module contract", () => {
  test("exports a root class", () => {
    expect(typeof styles.root).toBe("string");
    expect(styles.root.length).toBeGreaterThan(0);
  });
});
