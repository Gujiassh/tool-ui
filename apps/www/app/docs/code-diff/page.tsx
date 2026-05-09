import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Code Diff",
  description: "Compare code changes with syntax-highlighted diffs",
};

export const revalidate = 3600;

export default function CodeDiffDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="code-diff" />;
}
