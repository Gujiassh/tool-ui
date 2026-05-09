import { ReactNode } from "react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/ui/cn";
import { ActiveNavLink } from "./header-active-link.client";
import { TrackedExternalAnchor } from "./tracked-external-anchor.client";

interface ResponsiveHeaderProps {
  rightContent?: ReactNode;
}

const navLinks = [
  { href: "/docs/overview", label: "Docs" },
  { href: "/docs/gallery", label: "Gallery" },
];

const iconButtonClass = cn(
  "flex size-8 items-center justify-center rounded-md text-muted-foreground",
  "hover:bg-accent/40 hover:text-foreground transition-colors",
);

export function ResponsiveHeader({ rightContent }: ResponsiveHeaderProps) {
  return (
    <div className="flex h-12 w-full items-center gap-2 px-4 md:px-6">
      <Link
        href="/"
        className="flex items-center gap-2 transition-opacity hover:opacity-80"
      >
        <LogoMark className="size-5" />
        <span className="text-sm font-medium tracking-tight">Tool UI</span>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden flex-1 items-center gap-0.5 pl-3 md:flex">
        {navLinks.map(({ href, label }) => (
          <ActiveNavLink key={href} href={href}>
            {label}
          </ActiveNavLink>
        ))}
      </nav>

      {/* Mobile spacer */}
      <div className="flex-1 md:hidden" />

      {/* Right cluster */}
      <div className="flex items-center gap-0.5">
        {rightContent}
        <TrackedExternalAnchor
          href="https://github.com/assistant-ui/tool-ui"
          destination="github"
          target="_blank"
          rel="noopener noreferrer"
          className={iconButtonClass}
        >
          <FaGithub className="size-4" />
          <span className="sr-only">GitHub Repository</span>
        </TrackedExternalAnchor>
        <TrackedExternalAnchor
          href="https://x.com/assistantui"
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
