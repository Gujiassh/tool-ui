import type { ReactNode } from "react";
import { ResponsiveHeader } from "@/app/components/layout/app-header.server";
import { cn } from "@/lib/ui/cn";

export type HeaderFrameProps = {
  children: ReactNode;
  rightContent?: ReactNode;
  background?: ReactNode;
};

export function HeaderFrameLayout({
  children,
  rightContent,
  background,
  animateClassName,
}: HeaderFrameProps & { animateClassName?: string }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {background ? (
        <div className="pointer-events-none fixed inset-0 z-0">
          {background}
        </div>
      ) : null}
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-border/30 border-b bg-background/70 backdrop-blur-xl",
          animateClassName,
        )}
      >
        <ResponsiveHeader rightContent={rightContent} />
      </header>
      <div className="relative z-10 flex w-full flex-1">{children}</div>
    </div>
  );
}

export function HeaderFrame(props: HeaderFrameProps) {
  return <HeaderFrameLayout {...props} />;
}
