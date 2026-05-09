import type { Metadata } from "next";
import { DocsArticle } from "../_components/docs-article";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Release notes and migration guidance",
};

export const revalidate = 3600;

export default function ChangelogDocsPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
