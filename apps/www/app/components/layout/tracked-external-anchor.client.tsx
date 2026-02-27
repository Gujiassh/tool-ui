"use client";

import * as React from "react";
import { analytics } from "@/lib/analytics";

type ExternalDestination = "github" | "npm" | "docs" | "other";

type TrackedExternalAnchorProps = React.ComponentPropsWithoutRef<"a"> & {
  destination: ExternalDestination;
};

export const TrackedExternalAnchor = React.forwardRef<
  HTMLAnchorElement,
  TrackedExternalAnchorProps
>(function TrackedExternalAnchor(
  { destination, href, onClick, ...props },
  ref,
) {
  const hrefValue = typeof href === "string" ? href : "";

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    analytics.external.linkClicked(destination, hrefValue);
    onClick?.(event);
  };

  return <a ref={ref} href={href} onClick={handleClick} {...props} />;
});
