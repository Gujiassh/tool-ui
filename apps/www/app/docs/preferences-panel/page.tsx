import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Preferences Panel",
  description: "Compact settings panel for user preferences",
};

export const revalidate = 3600;

export default function PreferencesPanelDocsPage() {
  return (
    <ComponentDocsTabs docs={<Content />} componentId="preferences-panel" />
  );
}
