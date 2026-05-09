"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getAllDocsPageLinks } from "./docs-pages";
import { cn } from "@/lib/ui/cn";
import { analytics } from "@/lib/analytics";

function useDocsPagination() {
  const pathname = usePathname();

  return React.useMemo(() => {
    const links = getAllDocsPageLinks();
    const currentIndex = links.findIndex((link) => link.path === pathname);
    if (currentIndex === -1) return { prev: null, next: null };
    const prev = currentIndex > 0 ? links[currentIndex - 1] : null;
    const next =
      currentIndex < links.length - 1 ? links[currentIndex + 1] : null;
    return { prev, next };
  }, [pathname]);
}

type PagerLinkProps = {
  href: string;
  label: string;
  direction: "prev" | "next";
};

function PagerLink({ href, label, direction }: PagerLinkProps) {
  const isPrev = direction === "prev";
  return (
    <Link
      href={href}
      onClick={() => analytics.docs.navigationClicked(label, href)}
      aria-label={`Go to ${label}`}
      className={cn(
        "group inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors hover:text-foreground",
        isPrev ? "justify-start" : "justify-end text-right",
      )}
    >
      {isPrev ? (
        <>
          <ArrowLeft className="size-3.5 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          <span>{label}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </Link>
  );
}

export function DocsPager() {
  const { prev, next } = useDocsPagination();

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Pagination"
      className="not-prose mt-16 flex flex-row items-center justify-between gap-4 border-t border-border/40 pt-6"
    >
      {prev ? (
        <PagerLink href={prev.path} label={prev.label} direction="prev" />
      ) : (
        <span className="flex-1" />
      )}
      {next ? (
        <PagerLink href={next.path} label={next.label} direction="next" />
      ) : (
        <span className="flex-1" />
      )}
    </nav>
  );
}
