"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { analytics } from "@/lib/analytics";
import type { GalleryComponentDocId } from "@/lib/docs/gallery-component-docs";
import { cn } from "@/lib/ui/cn";

interface GalleryDocsLinkProps {
  componentId: GalleryComponentDocId;
  label: string;
  href: `/docs/${string}`;
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
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-1 whitespace-nowrap rounded-md hover:no-underline focus-visible:no-underline focus-visible:ring-2 focus-visible:ring-neutral-200/90 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 dark:focus-visible:ring-neutral-800 dark:focus-visible:ring-offset-neutral-100",
        className,
      )}
      onClick={handleClick}
    >
      <span className="whitespace-nowrap font-semibold text-sm">{label}</span>
      <span
        className="text-neutral-400 dark:text-neutral-500"
        aria-hidden="true"
      >
        •
      </span>
      <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs">
        <span className="underline-offset-2 group-hover:underline group-focus-visible:underline">
          View Docs
        </span>
        <ArrowRight className="size-3" aria-hidden="true" />
      </span>
    </Link>
  );
}
