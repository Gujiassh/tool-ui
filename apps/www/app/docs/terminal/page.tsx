import type { Metadata } from "next";
import { ComponentDocsTabs } from "../_components/component-docs-tabs";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Terminal",
  description: "Show command-line output and logs",
};

export const revalidate = 3600;

export default function TerminalDocsPage() {
  return <ComponentDocsTabs docs={<Content />} componentId="terminal" />;
}
