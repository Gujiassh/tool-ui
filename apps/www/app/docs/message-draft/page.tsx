import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Message Draft",
  description: "Review and approve messages before an AI agent sends them",
};

export const revalidate = 3600;

export default function MessageDraftDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="message-draft" />;
}
