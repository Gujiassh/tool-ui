import { componentsRegistry } from "@/lib/docs/component-registry";

export type DocsPageLink = {
  path: string;
  label: string;
};

export const GET_STARTED_DOCS_PAGES: DocsPageLink[] = [
  { path: "/docs/overview", label: "Overview" },
  { path: "/docs/quick-start", label: "Quick Start" },
  { path: "/docs/agent-skills", label: "Agent Skills" },
  { path: "/docs/advanced", label: "Advanced" },
  { path: "/docs/design-guidelines", label: "UI Guidelines" },
  { path: "/docs/changelog", label: "Changelog" },
];

export const CONCEPTS_DOCS_PAGES: DocsPageLink[] = [
  { path: "/docs/actions", label: "Actions" },
  { path: "/docs/receipts", label: "Receipts" },
];

export const BASE_DOCS_PAGES: DocsPageLink[] = [
  ...GET_STARTED_DOCS_PAGES,
  ...CONCEPTS_DOCS_PAGES,
];

export function getAllDocsPageLinks(): DocsPageLink[] {
  return [
    ...BASE_DOCS_PAGES,
    ...componentsRegistry.map((component) => ({
      path: component.path,
      label: component.label,
    })),
  ];
}
