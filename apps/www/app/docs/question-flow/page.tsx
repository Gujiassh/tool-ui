import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Question Flow",
  description: "Multi-step guided questions with branching",
};

export const revalidate = 3600;

export default function QuestionFlowDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="question-flow" />;
}
