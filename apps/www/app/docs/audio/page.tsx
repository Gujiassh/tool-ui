import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Audio",
  description: "Audio playback with artwork and metadata",
};

export const revalidate = 3600;

export default function AudioDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="audio" />;
}
