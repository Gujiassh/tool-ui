import type { ReactNode } from "react";
import { DocsContent } from "./docs-content";
import { DocsTocWrapper } from "./docs-toc-wrapper";

export function DocsArticle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] gap-8 px-4 pt-10 pb-24 sm:px-6 lg:px-10 xl:px-12">
      <DocsContent className={className}>{children}</DocsContent>
      <DocsTocWrapper />
    </div>
  );
}
