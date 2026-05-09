import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Plan",
  description: "Display step-by-step task workflows",
};

export const revalidate = 3600;

export default function PlanDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="plan" />;
}
