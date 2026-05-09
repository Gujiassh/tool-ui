import type { ReactNode } from "react";
import { DocsContent } from "./docs-content";
import { DocsToc } from "./docs-toc";

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
      <div className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-16">
          <DocsToc />
        </div>
      </div>
    </div>
  );
}
