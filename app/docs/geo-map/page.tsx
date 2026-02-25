import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";

export const metadata: Metadata = {
  title: "Geo Map",
  description: "Display geolocated entities directly in chat",
};

export const revalidate = 3600;

export default function GeoMapDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="geo-map" />;
}
