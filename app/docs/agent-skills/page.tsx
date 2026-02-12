import type { Metadata } from "next";
import Content from "./content.mdx";
import { DocsArticle } from "../_components/docs-article";

export const metadata: Metadata = {
  title: "Agent Skills",
  description: "Let your coding agent to the heavy lifting.",
};

export const revalidate = 3600;

export default function AgentSkillsPage() {
  return (
    <DocsArticle>
      <Content />
    </DocsArticle>
  );
}
