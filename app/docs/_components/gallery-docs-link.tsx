"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface GalleryDocsLinkProps {
  componentId: string;
  label: string;
  href: string;
  className?: string;
}

export function GalleryDocsLink({
  componentId,
  label,
  href,
  className,
}: GalleryDocsLinkProps) {
  const handleClick = () => {
    analytics.gallery.componentClicked(componentId);
    analytics.docs.navigationClicked(label, href);
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      <span className="whitespace-nowrap text-sm font-semibold">{label}</span>
      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs">
        <span>View Docs</span>
        <ArrowRight className="size-3" aria-hidden="true" />
      </span>
    </Link>
  );
}
