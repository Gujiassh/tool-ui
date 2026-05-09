import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Approval Card",
  description: "Binary confirmation for agent actions",
};

export const revalidate = 3600;

export default function ApprovalCardDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="approval-card" />;
}
