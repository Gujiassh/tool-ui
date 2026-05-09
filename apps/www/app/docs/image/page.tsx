import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Image",
  description: "Display images with metadata and attribution",
};

export const revalidate = 3600;

export default function ImageDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="image" />;
}
