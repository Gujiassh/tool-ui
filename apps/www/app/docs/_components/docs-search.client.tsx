"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { analytics } from "@/lib/analytics";
import { componentsRegistry } from "@/lib/docs/component-registry";
import { cn } from "@/lib/ui/cn";
import { BASE_DOCS_PAGES } from "./docs-pages";
import { triggerSearchFromShortcut } from "./docs-search-shortcut";

type SearchResult = {
  kind: "page" | "component";
  label: string;
  href: string;
};

const SEARCH_RESULTS: SearchResult[] = [
  { kind: "page", label: "Gallery", href: "/docs/gallery" },
  ...BASE_DOCS_PAGES.map((page) => ({
    kind: "page" as const,
    label: page.label,
    href: page.path,
  })),
  ...componentsRegistry.map((component) => ({
    kind: "component" as const,
    label: component.label,
    href: component.path,
  })),
];

const MAX_RESULTS = 10;

export function DocsSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const lastTrackedSubmissionRef = React.useRef<string | null>(null);

  const trimmedQuery = query.trim();

  const filteredResults = React.useMemo(() => {
    if (trimmedQuery.length === 0) return SEARCH_RESULTS.slice(0, MAX_RESULTS);

    const normalized = trimmedQuery.toLowerCase();
    return SEARCH_RESULTS.filter((result) =>
      result.label.toLowerCase().includes(normalized),
    ).slice(0, MAX_RESULTS);
  }, [trimmedQuery]);

  const trackSubmittedQuery = React.useCallback(() => {
    if (trimmedQuery.length === 0) return;

    const resultsCount = filteredResults.length;
    const signature = `${trimmedQuery.toLowerCase()}::${resultsCount}`;

    if (lastTrackedSubmissionRef.current === signature) return;

    analytics.search.querySubmitted(trimmedQuery, resultsCount);
    if (resultsCount === 0) {
      analytics.search.noResults(trimmedQuery);
    }
    lastTrackedSubmissionRef.current = signature;
  }, [filteredResults.length, trimmedQuery]);

  const openSearch = React.useCallback((source: "header" | "keyboard") => {
    analytics.search.opened(source);
    setOpen(true);
  }, []);

  const closeSearch = React.useCallback(() => {
    setOpen(false);
    setQuery("");
    lastTrackedSubmissionRef.current = null;
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      triggerSearchFromShortcut(event, () => openSearch("keyboard"));
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 px-3"
        onClick={() => openSearch("header")}
      >
        <SearchIcon className="size-4" />
        <span className="hidden text-sm sm:inline">Search</span>
        <span className="hidden rounded border px-1.5 py-0.5 text-muted-foreground text-xs sm:inline">
          Cmd+K
        </span>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeSearch();
            return;
          }
          setOpen(true);
        }}
      >
        <DialogContent showCloseButton={false} className="p-0 sm:max-w-xl">
          <DialogTitle className="sr-only">Search Tool UI Docs</DialogTitle>
          <form
            className="border-b p-3"
            onSubmit={(event) => {
              event.preventDefault();
              trackSubmittedQuery();
            }}
          >
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pages and components..."
              aria-label="Search pages and components"
              className="h-10"
            />
          </form>

          <div className="max-h-[360px] overflow-y-auto p-2">
            {filteredResults.length === 0 ? (
              <div className="px-3 py-8 text-center text-muted-foreground text-sm">
                No results found
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredResults.map((result, index) => (
                  <li key={`${result.kind}:${result.href}`}>
                    <Link
                      href={result.href}
                      onClick={() => {
                        trackSubmittedQuery();
                        analytics.search.resultClicked(
                          trimmedQuery,
                          result.href,
                          index + 1,
                        );
                        closeSearch();
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-muted",
                      )}
                    >
                      <span className="text-sm">{result.label}</span>
                      <span className="text-muted-foreground text-xs uppercase">
                        {result.kind}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
