import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Citation",
  description: "Display source references with attribution",
};

export const revalidate = 3600;

export default function CitationDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="citation" />;
}
