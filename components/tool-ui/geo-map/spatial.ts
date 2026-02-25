import type { GeoMapMarker, GeoMapRoute } from "./schema";

export type GeoMapBbox = [
  west: number,
  south: number,
  east: number,
  north: number,
];
export type GeoMapLatLng = [lat: number, lng: number];
export type FitTarget = "markers" | "routes" | "all";

export type GeoMapClusterProperties = {
  cluster?: boolean;
  cluster_id?: number;
  point_count?: number;
  markerId?: string;
};

export type GeoMapClusterFeature = GeoJSON.Feature<
  GeoJSON.Point,
  GeoMapClusterProperties
>;

export function collectFitPoints(
  markers: GeoMapMarker[],
  routes: GeoMapRoute[],
  target: FitTarget,
): GeoMapLatLng[] {
  const markerPoints =
    target === "markers" || target === "all"
      ? markers.map((marker) => [marker.lat, marker.lng] as GeoMapLatLng)
      : [];

  const routePoints =
    target === "routes" || target === "all"
      ? routes.flatMap((route) =>
          route.points.map((point) => [point.lat, point.lng] as GeoMapLatLng),
        )
      : [];

  return [...markerPoints, ...routePoints];
}

export function resolveFitPointsWithFallback(
  markers: GeoMapMarker[],
  routes: GeoMapRoute[],
  target: FitTarget,
): GeoMapLatLng[] {
  const selected = collectFitPoints(markers, routes, target);
  if (selected.length > 0) {
    return selected;
  }

  if (target !== "markers") {
    return collectFitPoints(markers, routes, "markers");
  }

  return [];
}

export function splitDatelineBbox(bbox: GeoMapBbox): GeoMapBbox[] {
  const [west, south, east, north] = bbox;

  if (west <= east) {
    return [bbox];
  }

  return [
    [west, south, 180, north],
    [-180, south, east, north],
  ];
}

function getClusterFeatureKey(feature: GeoMapClusterFeature): string {
  const properties = feature.properties ?? {};

  if (properties.cluster && typeof properties.cluster_id === "number") {
    return `cluster:${properties.cluster_id}`;
  }

  if (
    typeof properties.markerId === "string" &&
    properties.markerId.length > 0
  ) {
    return `marker:${properties.markerId}`;
  }

  if (feature.id !== undefined && feature.id !== null) {
    return `id:${String(feature.id)}`;
  }

  const [lng, lat] = feature.geometry.coordinates;
  return `point:${lat}:${lng}`;
}

function dedupeClusterFeatures(
  features: GeoMapClusterFeature[],
): GeoMapClusterFeature[] {
  const seen = new Set<string>();
  const deduped: GeoMapClusterFeature[] = [];

  features.forEach((feature) => {
    const key = getClusterFeatureKey(feature);
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    deduped.push(feature);
  });

  return deduped;
}

export function getClustersForDatelineAwareBbox(
  bbox: GeoMapBbox,
  zoom: number,
  getClustersForBbox: (
    candidateBbox: GeoMapBbox,
    zoom: number,
  ) => GeoMapClusterFeature[],
): GeoMapClusterFeature[] {
  const queried = splitDatelineBbox(bbox).flatMap((candidateBbox) =>
    getClustersForBbox(candidateBbox, zoom),
  );

  return dedupeClusterFeatures(queried);
}

export function toSafeExpansionZoom(
  zoom: number,
  options?: { minZoom?: number; maxZoom?: number; fallback?: number },
): number {
  const minZoom = options?.minZoom ?? 1;
  const maxZoom = options?.maxZoom ?? 22;
  const fallback = options?.fallback ?? 2;

  if (!Number.isFinite(zoom)) {
    return fallback;
  }

  return Math.min(maxZoom, Math.max(minZoom, Math.round(zoom)));
}
