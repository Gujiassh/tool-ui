import type { Metadata } from "next";
import { DocsArticle } from "../_components/docs-article";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Quick Start",
  description: "Get started with Tool UI in minutes",
};

export const revalidate = 3600;

export default function QuickStartPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
