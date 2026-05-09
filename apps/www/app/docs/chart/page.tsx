import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Chart",
  description: "Visualize data with interactive charts",
};

export const revalidate = 3600;

export default function ChartDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="chart" />;
}
