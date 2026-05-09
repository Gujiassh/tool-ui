"use client";

import { createContext, type ReactNode, useContext } from "react";
import { type Heading, useExtractHeadings } from "@/hooks/use-extract-headings";
import { useHeadingsObserver } from "@/hooks/use-headings-observer";

type DocsTocContextValue = {
  headings: Heading[];
  activeId: string | null;
};

const DocsTocContext = createContext<DocsTocContextValue | null>(null);

export function useDocsToc() {
  const context = useContext(DocsTocContext);
  if (!context) {
    throw new Error("useDocsToc must be used within DocsTocProvider");
  }
  return context;
}

export function DocsTocProvider({ children }: { children: ReactNode }) {
  const headings = useExtractHeadings();
  const activeId = useHeadingsObserver(headings);

  return (
    <DocsTocContext.Provider value={{ headings, activeId }}>
      {children}
    </DocsTocContext.Provider>
  );
}
