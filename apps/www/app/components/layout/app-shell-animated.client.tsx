"use client";

import { useEffect, useState } from "react";
import { HeaderFrameLayout, type HeaderFrameProps } from "./app-shell";

let hasPlayedIntroAnimation = false;

export function AnimatedHeaderFrame(props: HeaderFrameProps) {
  const [shouldAnimate] = useState(() => !hasPlayedIntroAnimation);

  useEffect(() => {
    if (shouldAnimate) {
      hasPlayedIntroAnimation = true;
    }
  }, [shouldAnimate]);

  return (
    <HeaderFrameLayout
      {...props}
      animateClassName={shouldAnimate ? "animate-navbar-fade-in" : undefined}
    />
  );
}
