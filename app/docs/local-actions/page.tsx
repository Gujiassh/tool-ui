import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Local Actions",
  description:
    "Use LocalActions for non-receipt interactions and DecisionActions for consequential commits.",
};

export const revalidate = 3600;

export default function LocalActionsPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
