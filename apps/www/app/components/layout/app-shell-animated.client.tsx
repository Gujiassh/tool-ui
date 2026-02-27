"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ResponsiveHeader } from "@/app/components/layout/app-header.server";
import { cn } from "@/lib/ui/cn";

type HeaderFrameProps = {
  children: ReactNode;
  rightContent?: ReactNode;
  background?: ReactNode;
};

// Persists for the life of the client bundle so the intro animation runs once.
let hasPlayedIntroAnimation = false;

function HeaderFrameBase({
  children,
  rightContent,
  background,
  shouldAnimate,
}: HeaderFrameProps & { shouldAnimate: boolean }) {
  return (
    <div className="relative flex h-full flex-col items-center overflow-hidden">
      {background ? (
        <div className="pointer-events-none absolute inset-0 z-0">
          {background}
        </div>
      ) : null}
      <div
        className={cn(
          "relative z-10 w-full max-w-[1440px] shrink-0 px-4 md:px-8",
          shouldAnimate && "animate-navbar-fade-in",
        )}
      >
        <ResponsiveHeader rightContent={rightContent} />
      </div>
      <div className="relative z-10 flex min-h-0 w-full flex-1 justify-center">
        {children}
      </div>
    </div>
  );
}

export function AnimatedHeaderFrame(props: HeaderFrameProps) {
  const [shouldAnimate] = useState(() => !hasPlayedIntroAnimation);

  useEffect(() => {
    if (shouldAnimate) {
      hasPlayedIntroAnimation = true;
    }
  }, [shouldAnimate]);

  return <HeaderFrameBase {...props} shouldAnimate={shouldAnimate} />;
}
