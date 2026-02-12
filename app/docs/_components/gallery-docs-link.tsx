"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface GalleryDocsLinkProps {
  componentId: string;
  componentName: string;
  href: string;
  className?: string;
}

export function GalleryDocsLink({
  componentId,
  componentName,
  href,
  className,
}: GalleryDocsLinkProps) {
  const handleClick = () => {
    analytics.gallery.componentClicked(componentId);
    analytics.docs.navigationClicked(componentName, href);
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      <span>View Docs</span>
      <ArrowRight className="size-3" aria-hidden="true" />
    </Link>
  );
}
