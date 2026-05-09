import type { ReactNode } from "react";

type ContentLayoutProps = {
  children: ReactNode;
  sidebar?: ReactNode;
};

export default function ContentLayout({
  children,
  sidebar,
}: ContentLayoutProps) {
  return (
    <div className="flex w-full flex-1">
      {sidebar ? (
        <aside className="scrollbar-subtle sticky top-12 hidden h-[calc(100vh-3rem)] w-[260px] shrink-0 overflow-y-auto border-border/30 border-r md:block">
          {sidebar}
        </aside>
      ) : null}
      <div className="flex w-full min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
