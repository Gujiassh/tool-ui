import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { DocsPager } from "./docs-pager";

interface DocsContentProps {
  children: ReactNode;
  className?: string;
}

export function DocsContent({ children, className }: DocsContentProps) {
  return (
    <div
      className={cn(
        "prose dark:prose-invert mx-auto min-w-0 max-w-3xl",
        className,
      )}
    >
      {children}
      <DocsPager />
    </div>
  );
}
