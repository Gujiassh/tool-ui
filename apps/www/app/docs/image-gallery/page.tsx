import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Image Gallery",
  description: "Masonry grid with fullscreen carousel viewer",
};

export const revalidate = 3600;

export default function ImageGalleryDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="image-gallery" />;
}
