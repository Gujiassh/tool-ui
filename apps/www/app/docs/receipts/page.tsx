import type { Metadata } from "next";
import { DocsArticle } from "../_components/docs-article";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Receipts",
  description: "Confirm what happened after a user decision",
};

export const revalidate = 3600;

export default function ReceiptsPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
