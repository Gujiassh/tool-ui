import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Option List",
  description: "Let users select from multiple choices",
};

export const revalidate = 3600;

export default function OptionListDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="option-list" />;
}
