// CSS module imports should always expose a class-name map, even when
// typechecking outside Next.js's normal bundler pipeline.
declare module "*.module.css" {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

// Plain CSS files are imported for side-effects (e.g. globals, Leaflet CSS).
declare module "*.css" {}
