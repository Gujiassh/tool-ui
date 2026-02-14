"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MobileNavSheet = dynamic(
  () =>
    import("@/app/components/layout/mobile-nav-sheet.client").then(
      (mod) => mod.MobileNavSheet,
    ),
  {
    ssr: false,
  },
);

const MOBILE_QUERY = "(max-width: 767px)";

function shouldRenderForPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/builder")
  );
}

export function MobileNavSheetGate() {
  const pathname = usePathname();
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const updateViewportMatch = () => setIsMobileViewport(mediaQuery.matches);

    updateViewportMatch();
    mediaQuery.addEventListener("change", updateViewportMatch);

    return () => {
      mediaQuery.removeEventListener("change", updateViewportMatch);
    };
  }, []);

  if (!isMobileViewport || !shouldRenderForPath(pathname)) {
    return null;
  }

  return <MobileNavSheet />;
}
