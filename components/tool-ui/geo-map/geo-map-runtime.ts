export type LeafletRuntime = Pick<
  typeof import("leaflet"),
  "divIcon" | "latLngBounds"
>;
