import type { LayerKey } from "../hooks/use-tuning-state";

export type TunableLayerKey = Exclude<LayerKey, "layers">;

export interface ParameterDef {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
}

export interface ParameterGroup {
  name: string;
  layer: TunableLayerKey;
  params: ParameterDef[];
}

export const PARAMETER_GROUPS: ParameterGroup[] = [
  {
    name: "Sky",
    layer: "celestial",
    params: [
      {
        key: "celestialY",
        label: "Sun/Moon Height",
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        key: "celestialX",
        label: "Sun/Moon Position",
        min: 0,
        max: 1,
        step: 0.01,
      },
      { key: "skyBrightness", label: "Brightness", min: 0, max: 2, step: 0.01 },
      { key: "skySaturation", label: "Saturation", min: 0, max: 2, step: 0.01 },
      { key: "skyContrast", label: "Contrast", min: 0, max: 2, step: 0.01 },
      { key: "starDensity", label: "Star Density", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    name: "Sun Rays",
    layer: "celestial",
    params: [
      {
        key: "sunRayIntensity",
        label: "Ray Intensity",
        min: 0,
        max: 3,
        step: 0.01,
      },
      {
        key: "sunRayShimmer",
        label: "Ray Shimmer",
        min: 0,
        max: 5,
        step: 0.05,
      },
      {
        key: "sunRayShimmerSpeed",
        label: "Ray Shimmer Speed",
        min: 0,
        max: 5,
        step: 0.05,
      },
    ],
  },
  {
    name: "Clouds",
    layer: "cloud",
    params: [
      { key: "coverage", label: "Coverage", min: 0, max: 1, step: 0.01 },
      { key: "density", label: "Density", min: 0, max: 1, step: 0.01 },
      { key: "softness", label: "Softness", min: 0, max: 1, step: 0.01 },
      {
        key: "lightIntensity",
        label: "Light Intensity",
        min: 0,
        max: 2,
        step: 0.01,
      },
      {
        key: "ambientDarkness",
        label: "Ambient Darkness",
        min: 0,
        max: 1,
        step: 0.01,
      },
    ],
  },
  {
    name: "Rain",
    layer: "rain",
    params: [
      {
        key: "fallingIntensity",
        label: "Falling Intensity",
        min: 0,
        max: 1,
        step: 0.01,
      },
      {
        key: "fallingSpeed",
        label: "Falling Speed",
        min: 0.1,
        max: 3,
        step: 0.1,
      },
      {
        key: "glassIntensity",
        label: "Glass Droplets",
        min: 0,
        max: 1,
        step: 0.01,
      },
    ],
  },
  {
    name: "Snow",
    layer: "snow",
    params: [
      { key: "intensity", label: "Intensity", min: 0, max: 1, step: 0.01 },
      { key: "fallSpeed", label: "Fall Speed", min: 0.1, max: 3, step: 0.1 },
      { key: "windSpeed", label: "Wind", min: 0, max: 2, step: 0.01 },
      { key: "drift", label: "Drift", min: 0, max: 1, step: 0.01 },
    ],
  },
  {
    name: "Lightning",
    layer: "lightning",
    params: [
      {
        key: "glowIntensity",
        label: "Flash Intensity",
        min: 0,
        max: 2,
        step: 0.01,
      },
      {
        key: "branchDensity",
        label: "Branch Density",
        min: 0,
        max: 1,
        step: 0.01,
      },
    ],
  },
];
