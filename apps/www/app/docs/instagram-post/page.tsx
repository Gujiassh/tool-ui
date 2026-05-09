import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Instagram Post",
  description: "Render Instagram post previews",
};

export const revalidate = 3600;

export default function InstagramPostDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="instagram-post" />;
}
