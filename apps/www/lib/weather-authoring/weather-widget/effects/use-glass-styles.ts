"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";

interface GlassEffectOptions {
  depth: number;
  radius: number;
  strength: number;
  chromaticAberration: number;
  blur: number;
  brightness: number;
  saturation: number;
}

const DEFAULT_GLASS_OPTIONS: GlassEffectOptions = {
  depth: 12,
  radius: 12,
  strength: 40,
  chromaticAberration: 8,
  blur: 2,
  brightness: 1.05,
  saturation: 1.2,
} as const;

interface DisplacementMapParams {
  width: number;
  height: number;
  radius: number;
  depth: number;
}

function buildDisplacementMapSvg({
  width,
  height,
  radius,
  depth,
}: DisplacementMapParams): string {
  const radiusYPct = Math.ceil((radius / height) * 15);
  const radiusXPct = Math.ceil((radius / width) * 15);
  const innerWidth = Math.max(0, width - 2 * depth);
  const innerHeight = Math.max(0, height - 2 * depth);

  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>.mix { mix-blend-mode: screen; }</style>
    <defs>
      <linearGradient id="Y" x1="0" x2="0" y1="${radiusYPct}%" y2="${100 - radiusYPct}%">
        <stop offset="0%" stop-color="#0F0" />
        <stop offset="100%" stop-color="#000" />
      </linearGradient>
      <linearGradient id="X" x1="${radiusXPct}%" x2="${100 - radiusXPct}%" y1="0" y2="0">
        <stop offset="0%" stop-color="#F00" />
        <stop offset="100%" stop-color="#000" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
    <g filter="blur(2px)">
      <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" class="mix" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" class="mix" />
      <rect x="${depth}" y="${depth}" height="${innerHeight}" width="${innerWidth}" fill="#808080" rx="${radius}" ry="${radius}" filter="blur(${depth}px)" />
    </g>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface DisplacementFilterParams extends DisplacementMapParams {
  strength: number;
  chromaticAberration: number;
}

function buildDisplacementFilterUrl({
  width,
  height,
  radius,
  depth,
  strength,
  chromaticAberration,
}: DisplacementFilterParams): string {
  const mapUrl = buildDisplacementMapSvg({ width, height, radius, depth });
  const feImage = `<feImage x="0" y="0" height="${height}" width="${width}" href="${mapUrl}" result="displacementMap" />`;

  let filterContent: string;
  if (chromaticAberration === 0) {
    filterContent = `
      ${feImage}
      <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${strength}" xChannelSelector="R" yChannelSelector="G" />
    `;
  } else {
    const redScale = strength + chromaticAberration * 2;
    const greenScale = strength + chromaticAberration;
    const blueScale = strength;
    filterContent = `
      ${feImage}
      <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${redScale}" xChannelSelector="R" yChannelSelector="G" />
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="displacedR" />
      <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${greenScale}" xChannelSelector="R" yChannelSelector="G" />
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="displacedG" />
      <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${blueScale}" xChannelSelector="R" yChannelSelector="G" />
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="displacedB" />
      <feBlend in="displacedR" in2="displacedG" mode="screen"/>
      <feBlend in2="displacedB" mode="screen"/>
    `;
  }

  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="displace" color-interpolation-filters="sRGB">${filterContent}</filter>
    </defs>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}#displace`;
}

interface BackdropFilterParams {
  filterUrl: string;
  blur: number;
  brightness: number;
  saturation: number;
}

function buildBackdropFilterValue({
  filterUrl,
  blur,
  brightness,
  saturation,
}: BackdropFilterParams): string {
  return `blur(${blur / 2}px) url('${filterUrl}') blur(${blur}px) brightness(${brightness}) saturate(${saturation})`;
}

function useSupportsBackdropFilter(): boolean {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    const hasSupport =
      CSS.supports("backdrop-filter", "blur(1px)") ||
      CSS.supports("-webkit-backdrop-filter", "blur(1px)");
    setSupported(hasSupport);
  }, []);

  return supported;
}

export interface UseGlassStylesOptions {
  width: number;
  height: number;
  depth?: number;
  radius?: number;
  strength?: number;
  chromaticAberration?: number;
  blur?: number;
  brightness?: number;
  saturation?: number;
  enabled?: boolean;
}

export function useGlassStyles({
  width,
  height,
  depth = DEFAULT_GLASS_OPTIONS.depth,
  radius = DEFAULT_GLASS_OPTIONS.radius,
  strength = DEFAULT_GLASS_OPTIONS.strength,
  chromaticAberration = DEFAULT_GLASS_OPTIONS.chromaticAberration,
  blur = DEFAULT_GLASS_OPTIONS.blur,
  brightness = DEFAULT_GLASS_OPTIONS.brightness,
  saturation = DEFAULT_GLASS_OPTIONS.saturation,
  enabled = true,
}: UseGlassStylesOptions): CSSProperties {
  const supported = useSupportsBackdropFilter();

  return useMemo(() => {
    if (!enabled || !supported || width <= 0 || height <= 0) {
      return {};
    }

    const filterUrl = buildDisplacementFilterUrl({
      width,
      height,
      radius,
      depth,
      strength,
      chromaticAberration,
    });
    const backdropFilter = buildBackdropFilterValue({
      filterUrl,
      blur,
      brightness,
      saturation,
    });

    return {
      backdropFilter,
      WebkitBackdropFilter: backdropFilter,
    };
  }, [
    width,
    height,
    depth,
    radius,
    strength,
    chromaticAberration,
    blur,
    brightness,
    saturation,
    enabled,
    supported,
  ]);
}
