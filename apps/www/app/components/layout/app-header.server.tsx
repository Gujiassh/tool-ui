import Link from "next/link";
import { ReactNode } from "react";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { LogoMark } from "@/components/ui/logo";
import { SITE_LINKS } from "@/lib/site-config";
import { cn } from "@/lib/ui/cn";
import { NavMenu } from "./nav-menu.client";
import { TrackedExternalAnchor } from "./tracked-external-anchor.client";

interface ResponsiveHeaderProps {
  rightContent?: ReactNode;
}

const iconButtonClass = cn(
  "flex size-8 items-center justify-center rounded-md text-muted-foreground",
  "transition-colors hover:bg-accent/40 hover:text-foreground",
);

export function ResponsiveHeader({ rightContent }: ResponsiveHeaderProps) {
  return (
    <div className="flex h-12 w-full items-center gap-2 px-4 md:px-6">
      <Link
        href="/"
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <LogoMark className="size-5" />
        <span className="font-medium text-sm tracking-tight">Tool UI</span>
      </Link>

      <NavMenu />

      {/* Mobile spacer */}
      <div className="flex-1 md:hidden" />

      {/* Right cluster */}
      <div className="flex items-center gap-0.5">
        {rightContent}
        <TrackedExternalAnchor
          href={SITE_LINKS.github}
          destination="github"
          target="_blank"
          rel="noopener noreferrer"
          className={iconButtonClass}
        >
          <FaGithub className="size-4" />
          <span className="sr-only">GitHub Repository</span>
        </TrackedExternalAnchor>
        <TrackedExternalAnchor
          href={SITE_LINKS.twitter}
          destination="other"
          target="_blank"
          rel="noopener noreferrer"
          className={iconButtonClass}
        >
          <FaXTwitter className="size-4" />
          <span className="sr-only">X (Twitter)</span>
        </TrackedExternalAnchor>
      </div>
    </div>
  );
}
