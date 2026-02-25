export const GEO_MAP_TOOLTIP_CLASS = "geo-map-tooltip";
export const GEO_MAP_POPUP_CLASS = "geo-map-popup";

export const GEO_MAP_LEAFLET_SHELL_STYLES = `
[data-slot="geo-map"] {
  --geo-map-tooltip-bg: var(--foreground);
  --geo-map-tooltip-fg: var(--background);
  --geo-map-tooltip-shadow: 0 8px 20px oklch(from var(--foreground) l c h / 0.18);
  --geo-map-tooltip-radius: calc(var(--radius) - 2px);
  --geo-map-tooltip-padding: 0.375rem 0.625rem;
  --geo-map-tooltip-font-size: 0.75rem;
  --geo-map-tooltip-font-weight: 500;
  --geo-map-tooltip-line-height: 1.2;
  --geo-map-popup-margin-bottom: 12px;
  --geo-map-popup-border: oklch(from var(--border) l c h / 0.85);
  --geo-map-popup-radius: calc(var(--radius) + 2px);
  --geo-map-popup-bg: oklch(from var(--popover) l c h / 0.96);
  --geo-map-popup-fg: var(--popover-foreground);
  --geo-map-popup-shadow: 0 10px 30px oklch(from var(--foreground) l c h / 0.12);
  --geo-map-popup-blur: 8px;
  --geo-map-popup-content-padding: 0.625rem 0.75rem;
  --geo-map-popup-max-width: min(80vw, 18rem);
  --geo-map-popup-font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
  --geo-map-zoom-bg: var(--background);
  --geo-map-zoom-fg: var(--foreground);
  --geo-map-zoom-border: var(--border);
  --geo-map-zoom-hover-bg: var(--accent);
  --geo-map-zoom-hover-fg: var(--accent-foreground);
  --geo-map-zoom-disabled-bg: var(--muted);
  --geo-map-zoom-disabled-fg: var(--muted-foreground);
  --geo-map-zoom-shadow: 0 1px 2px oklch(from var(--foreground) l c h / 0.08);
  --geo-map-zoom-focus-ring: var(--ring);
  --geo-map-zoom-radius: 0.5rem;
  --geo-map-zoom-size: 2.25rem;
  --geo-map-zoom-font-size: 1.125rem;
}

[data-slot="geo-map"] .leaflet-control-zoom {
  border: 1px solid var(--geo-map-zoom-border);
  box-shadow: var(--geo-map-zoom-shadow);
  background: var(--geo-map-zoom-bg);
}

[data-slot="geo-map"] .leaflet-control-zoom.leaflet-bar {
  border-radius: var(--geo-map-zoom-radius) !important;
}

[data-slot="geo-map"] .leaflet-control-zoom a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--geo-map-zoom-size);
  height: var(--geo-map-zoom-size);
  line-height: 1;
  text-indent: 0;
  border: 0;
  background: transparent;
  color: var(--geo-map-zoom-fg);
  font-size: var(--geo-map-zoom-font-size);
  font-weight: 500;
  box-shadow: none;
  cursor: default;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease,
    box-shadow 150ms ease,
    opacity 150ms ease;
  border-radius: 0 !important;
}

[data-slot="geo-map"] .leaflet-control-zoom a + a {
  border-top: 1px solid var(--geo-map-zoom-border);
}

[data-slot="geo-map"] .leaflet-control-zoom a:first-child,
[data-slot="geo-map"] .leaflet-touch .leaflet-control-zoom a:first-child,
[data-slot="geo-map"] .leaflet-control-zoom .leaflet-control-zoom-in {
  border-radius: var(--geo-map-zoom-radius) var(--geo-map-zoom-radius) 0 0 !important;
}

[data-slot="geo-map"] .leaflet-control-zoom a:last-child,
[data-slot="geo-map"] .leaflet-touch .leaflet-control-zoom a:last-child,
[data-slot="geo-map"] .leaflet-control-zoom .leaflet-control-zoom-out {
  border-top: 0;
  border-radius: 0 0 var(--geo-map-zoom-radius) var(--geo-map-zoom-radius) !important;
}

[data-slot="geo-map"] .leaflet-control-zoom a:hover {
  background: var(--geo-map-zoom-hover-bg);
  color: var(--geo-map-zoom-hover-fg);
}

[data-slot="geo-map"] .leaflet-control-zoom a:focus,
[data-slot="geo-map"] .leaflet-control-zoom a:focus-visible {
  position: relative;
  z-index: 1;
  outline: 2px solid var(--geo-map-zoom-focus-ring);
  outline-offset: 1px;
}

[data-slot="geo-map"] .leaflet-control-zoom a.leaflet-disabled,
[data-slot="geo-map"] .leaflet-control-zoom a.leaflet-disabled:hover {
  background: var(--geo-map-zoom-disabled-bg);
  color: var(--geo-map-zoom-disabled-fg);
  opacity: 0.55;
}

[data-slot="geo-map"] .leaflet-tooltip.geo-map-tooltip {
  border: 0;
  border-radius: var(--geo-map-tooltip-radius);
  background: var(--geo-map-tooltip-bg);
  color: var(--geo-map-tooltip-fg);
  box-shadow: var(--geo-map-tooltip-shadow);
  font-size: var(--geo-map-tooltip-font-size);
  font-weight: var(--geo-map-tooltip-font-weight);
  line-height: var(--geo-map-tooltip-line-height);
  padding: var(--geo-map-tooltip-padding);
}

[data-slot="geo-map"] .leaflet-tooltip-top.geo-map-tooltip::before {
  border-top-color: var(--geo-map-tooltip-bg);
}

[data-slot="geo-map"] .leaflet-tooltip-bottom.geo-map-tooltip::before {
  border-bottom-color: var(--geo-map-tooltip-bg);
}

[data-slot="geo-map"] .leaflet-tooltip-left.geo-map-tooltip::before {
  border-left-color: var(--geo-map-tooltip-bg);
}

[data-slot="geo-map"] .leaflet-tooltip-right.geo-map-tooltip::before {
  border-right-color: var(--geo-map-tooltip-bg);
}

[data-slot="geo-map"] .leaflet-popup.geo-map-popup {
  margin-bottom: var(--geo-map-popup-margin-bottom);
}

[data-slot="geo-map"] .leaflet-popup.geo-map-popup .leaflet-popup-content-wrapper {
  border: 1px solid var(--geo-map-popup-border);
  border-radius: var(--geo-map-popup-radius);
  background: var(--geo-map-popup-bg);
  color: var(--geo-map-popup-fg);
  box-shadow: var(--geo-map-popup-shadow);
  backdrop-filter: blur(var(--geo-map-popup-blur));
  -webkit-backdrop-filter: blur(var(--geo-map-popup-blur));
  padding: 0;
}

[data-slot="geo-map"] .leaflet-popup.geo-map-popup .leaflet-popup-content {
  margin: 0;
  min-width: 0;
  width: max-content;
  max-width: var(--geo-map-popup-max-width);
  padding: var(--geo-map-popup-content-padding);
  font-family: var(--geo-map-popup-font-family);
}

[data-slot="geo-map"] .leaflet-popup.geo-map-popup .leaflet-popup-content p {
  margin: 0;
}

[data-slot="geo-map"] .leaflet-popup.geo-map-popup .leaflet-popup-tip-container,
[data-slot="geo-map"] .leaflet-popup.geo-map-popup .leaflet-popup-close-button {
  display: none;
}
`;
