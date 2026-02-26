"use client";

import type { Map as LeafletMap } from "leaflet";
import { useEffect, useRef } from "react";
import { useMap, useMapEvents } from "./_adapter";
import type { LeafletRuntime } from "./geo-map-runtime";
import type { GeoMapMarker, GeoMapRoute, GeoMapViewport } from "./schema";
import { resolveFitPointsWithFallback, type GeoMapBbox } from "./spatial";

const DEFAULT_CENTER: [number, number] = [20, 0];
export const DEFAULT_VIEW_ZOOM = 2;
const SINGLE_LOCATION_ZOOM = 13;
const DEFAULT_VIEWPORT_PADDING = 32;

export type MapViewportState = {
  bbox: GeoMapBbox;
  zoom: number;
};

function roundCoordinate(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

export function normalizeViewportState(
  state: MapViewportState,
): MapViewportState {
  return {
    bbox: [
      roundCoordinate(state.bbox[0]),
      roundCoordinate(state.bbox[1]),
      roundCoordinate(state.bbox[2]),
      roundCoordinate(state.bbox[3]),
    ],
    zoom: state.zoom,
  };
}

export function areViewportStatesEqual(
  a: MapViewportState | null,
  b: MapViewportState,
): boolean {
  if (!a) {
    return false;
  }

  return (
    a.zoom === b.zoom &&
    a.bbox[0] === b.bbox[0] &&
    a.bbox[1] === b.bbox[1] &&
    a.bbox[2] === b.bbox[2] &&
    a.bbox[3] === b.bbox[3]
  );
}

function serializeFitPoints(points: [number, number][]): string {
  return points
    .map(([lat, lng]) => `${roundCoordinate(lat)},${roundCoordinate(lng)}`)
    .join("|");
}

function readViewportState(map: LeafletMap): MapViewportState {
  const bounds = map.getBounds();
  return normalizeViewportState({
    bbox: [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ],
    zoom: Math.round(map.getZoom()),
  });
}

export function resolveInitialView(
  markers: GeoMapMarker[],
  routes: GeoMapRoute[],
  viewport: GeoMapViewport | undefined,
): { center: [number, number]; zoom: number } {
  if (viewport?.mode === "center") {
    return {
      center: [viewport.center.lat, viewport.center.lng],
      zoom: viewport.zoom,
    };
  }

  const fitTarget = viewport?.target ?? "all";
  const fitPoints = resolveFitPointsWithFallback(markers, routes, fitTarget);

  if (fitPoints.length === 1) {
    return {
      center: [fitPoints[0][0], fitPoints[0][1]],
      zoom: viewport?.maxZoom
        ? Math.min(SINGLE_LOCATION_ZOOM, viewport.maxZoom)
        : SINGLE_LOCATION_ZOOM,
    };
  }

  return { center: DEFAULT_CENTER, zoom: DEFAULT_VIEW_ZOOM };
}

export function ViewportController({
  markers,
  routes,
  viewport,
  leafletRuntime,
}: {
  markers: GeoMapMarker[];
  routes: GeoMapRoute[];
  viewport: GeoMapViewport | undefined;
  leafletRuntime: LeafletRuntime;
}) {
  const map = useMap();
  const lastAppliedViewportRef = useRef<string | null>(null);

  useEffect(() => {
    lastAppliedViewportRef.current = null;
  }, [map]);

  useEffect(() => {
    if (viewport?.mode === "center") {
      const viewportKey = `center:${roundCoordinate(viewport.center.lat)}:${roundCoordinate(viewport.center.lng)}:${viewport.zoom}`;
      if (lastAppliedViewportRef.current === viewportKey) {
        return;
      }

      lastAppliedViewportRef.current = viewportKey;
      map.setView([viewport.center.lat, viewport.center.lng], viewport.zoom);
      return;
    }

    const fitTarget = viewport?.target ?? "all";
    const fitPoints = resolveFitPointsWithFallback(markers, routes, fitTarget);
    if (fitPoints.length === 0) {
      return;
    }

    const maxZoom = viewport?.maxZoom;
    if (fitPoints.length === 1) {
      const [lat, lng] = fitPoints[0];
      const zoom = maxZoom
        ? Math.min(SINGLE_LOCATION_ZOOM, maxZoom)
        : SINGLE_LOCATION_ZOOM;
      const viewportKey = `fit-single:${roundCoordinate(lat)}:${roundCoordinate(lng)}:${zoom}`;
      if (lastAppliedViewportRef.current === viewportKey) {
        return;
      }

      lastAppliedViewportRef.current = viewportKey;
      map.setView([lat, lng], zoom);
      return;
    }

    const padding = viewport?.padding ?? DEFAULT_VIEWPORT_PADDING;
    const viewportKey = `fit:${fitTarget}:${padding}:${maxZoom ?? "none"}:${serializeFitPoints(fitPoints)}`;
    if (lastAppliedViewportRef.current === viewportKey) {
      return;
    }

    lastAppliedViewportRef.current = viewportKey;
    const bounds = leafletRuntime.latLngBounds(fitPoints);
    map.fitBounds(bounds, {
      maxZoom,
      padding: [padding, padding],
    });
  }, [leafletRuntime, map, markers, routes, viewport]);

  return null;
}

export function MapObserver({
  onViewportChange,
  onMapReady,
}: {
  onViewportChange: (state: MapViewportState) => void;
  onMapReady: (map: LeafletMap) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      onViewportChange(readViewportState(map));
    },
    zoomend: () => {
      onViewportChange(readViewportState(map));
    },
  });

  useEffect(() => {
    onMapReady(map);
    onViewportChange(readViewportState(map));
  }, [map, onMapReady, onViewportChange]);

  return null;
}
