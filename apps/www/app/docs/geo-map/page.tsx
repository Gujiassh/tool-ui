import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Geo Map",
  description: "Display geolocated entities, clusters, and routes.",
};

export const revalidate = 3600;

export default function GeoMapDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="geo-map" />;
}
