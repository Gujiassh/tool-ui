import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Data Table",
  description: "Present structured data in sortable tables",
};

export const revalidate = 3600;

export default function DataTableDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="data-table" />;
}
