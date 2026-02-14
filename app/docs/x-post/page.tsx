import type { Metadata } from "next";
import Content from "./content.mdx";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";

export const metadata: Metadata = {
  title: "X Post",
  description: "Render X post previews",
};

export const revalidate = 3600;

export default function XPostDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="x-post" />;
}
