import type { ReactNode } from "react";
import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ContentLayout from "@/app/components/layout/page-shell";
import { HeaderFrame } from "@/app/components/layout/app-shell";
import { ThemeToggle } from "@/app/components/builder/theme-toggle";
import { DocsNav } from "./_components/docs-nav";
import { DocsTocProvider } from "./_components/docs-toc-context";
import { DocsSearch } from "./_components/docs-search.client";
import { PreviewThemeControls } from "./_components/preview-theme-controls";

export const metadata: Metadata = {
  title: {
    template: "%s | Tool UI",
    default: "Docs | Tool UI",
  },
  description: "Documentation for Tool UI components",
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <HeaderFrame
        rightContent={
          <div className="flex items-center gap-2">
            <DocsSearch />
            <PreviewThemeControls />
            <ThemeToggle />
          </div>
        }
      >
        <DocsTocProvider>
          <ContentLayout sidebar={<DocsNav />}>{children}</ContentLayout>
        </DocsTocProvider>
      </HeaderFrame>
    </NuqsAdapter>
  );
}
