import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { LogoMark } from "@/components/ui/logo";
import { SITE_LINKS } from "@/lib/site-config";

type FooterLinkItem = {
  label: string;
  href: string;
  external?: boolean;
};

const FOOTER_LINKS: Record<string, FooterLinkItem[]> = {
  Documentation: [
    { label: "Overview", href: "/docs/overview" },
    { label: "Quick start", href: "/docs/quick-start" },
    { label: "Agent skills", href: "/docs/agent-skills" },
    { label: "Design guidelines", href: "/docs/design-guidelines" },
    { label: "Changelog", href: "/docs/changelog" },
  ],
  Components: [
    { label: "Gallery", href: "/docs/gallery" },
    { label: "Builder", href: "/builder" },
    { label: "Actions", href: "/docs/actions" },
    { label: "Receipts", href: "/docs/receipts" },
  ],
  Project: [
    { label: "GitHub", href: SITE_LINKS.github, external: true },
    { label: "Issues", href: SITE_LINKS.githubIssues, external: true },
    { label: "Releases", href: SITE_LINKS.githubReleases, external: true },
  ],
  Ecosystem: [
    { label: "assistant-ui", href: SITE_LINKS.assistantUi, external: true },
    {
      label: "assistant-ui Cloud",
      href: SITE_LINKS.assistantUiCloud,
      external: true,
    },
    { label: "Discord", href: SITE_LINKS.discord, external: true },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-border/30 border-t py-12 md:py-16">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 md:flex-row md:justify-between lg:px-10">
        <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-4 md:order-2 lg:gap-x-14">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-3">
              <p className="font-medium text-[13px] text-foreground">
                {category}
              </p>
              {links.map((link) => (
                <FooterLink
                  key={link.href}
                  href={link.href}
                  external={link.external}
                >
                  {link.label}
                </FooterLink>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 md:order-1 md:max-w-[280px]">
          <Link href="/" className="flex w-fit items-center gap-2">
            <LogoMark className="size-5" />
            <span className="font-medium text-sm tracking-tight">Tool UI</span>
          </Link>

          <p className="text-[13px] text-muted-foreground leading-[1.6]">
            UI components for AI assistants. Render JSON tool results as real
            interfaces, not data dumps.
          </p>

          <div className="flex gap-3 pt-1">
            <a
              href={SITE_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="GitHub"
            >
              <FaGithub className="size-[18px]" />
            </a>
            <a
              href={SITE_LINKS.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="X (Twitter)"
            >
              <FaXTwitter className="size-[18px]" />
            </a>
          </div>

          <a
            href={SITE_LINKS.assistantUi}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex w-fit items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Built by assistant-ui
            <ArrowUpRight className="size-3 opacity-50" />
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  const isExternal = external ?? href.startsWith("http");

  if (isExternal) {
    return (
      <a
        className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
        <ArrowUpRight className="size-3 opacity-40" />
      </a>
    );
  }
  return (
    <Link
      className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      href={href}
    >
      {children}
    </Link>
  );
}
