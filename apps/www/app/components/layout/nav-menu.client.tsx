"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/ui/cn";

type NavLink = {
  type: "link";
  label: string;
  href: string;
  match?: (pathname: string) => boolean;
};

type NavDropdownItem = {
  label: string;
  href: string;
  description?: string;
};

type NavDropdown = {
  type: "dropdown";
  label: string;
  items: NavDropdownItem[];
};

type NavItem = NavLink | NavDropdown;

const NAV_ITEMS: NavItem[] = [
  {
    type: "link",
    label: "Docs",
    href: "/docs/overview",
    match: (p) =>
      p.startsWith("/docs") && p !== "/docs/gallery" && p !== "/docs/changelog",
  },
  {
    type: "link",
    label: "Gallery",
    href: "/docs/gallery",
    match: (p) => p === "/docs/gallery",
  },
  {
    type: "link",
    label: "Builder",
    href: "/builder",
    match: (p) => p.startsWith("/builder"),
  },
  {
    type: "dropdown",
    label: "Resources",
    items: [
      {
        label: "Playground",
        href: "/playground",
        description: "Live chat sandbox",
      },
      {
        label: "Changelog",
        href: "/docs/changelog",
        description: "Latest updates",
      },
      {
        label: "Agent skills",
        href: "/docs/agent-skills",
        description: "Tool agent integration guide",
      },
      {
        label: "Design guidelines",
        href: "/docs/design-guidelines",
        description: "Component patterns and principles",
      },
    ],
  },
];

const navLinkClass = (isActive: boolean) =>
  cn(
    "rounded-md px-2.5 py-1 text-sm transition-colors",
    isActive
      ? "font-medium text-brand"
      : "text-muted-foreground hover:text-foreground",
  );

export function NavMenu() {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-1 items-center gap-0.5 pl-3 md:flex">
      {NAV_ITEMS.map((item) =>
        item.type === "link" ? (
          <NavLinkItem key={item.href} item={item} pathname={pathname} />
        ) : (
          <NavDropdownItem key={item.label} item={item} pathname={pathname} />
        ),
      )}
    </nav>
  );
}

function NavLinkItem({ item, pathname }: { item: NavLink; pathname: string }) {
  const isActive = item.match
    ? item.match(pathname)
    : pathname.startsWith(item.href);
  return (
    <Link href={item.href} className={navLinkClass(isActive)}>
      {item.label}
    </Link>
  );
}

function NavDropdownItem({
  item,
  pathname,
}: {
  item: NavDropdown;
  pathname: string;
}) {
  const isActive = item.items.some(
    (sub) => pathname === sub.href || pathname.startsWith(`${sub.href}/`),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            navLinkClass(isActive),
            "inline-flex items-center gap-1 outline-none",
          )}
        >
          {item.label}
          <ChevronDownIcon className="size-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[260px] p-1.5">
        {item.items.map((sub) => (
          <DropdownMenuItem
            key={sub.href}
            asChild
            className="cursor-pointer rounded-md px-2.5 py-2"
          >
            <Link href={sub.href} className="flex flex-col gap-0.5">
              <span className="text-[13.5px] font-medium text-foreground">
                {sub.label}
              </span>
              {sub.description && (
                <span className="text-[12px] text-muted-foreground">
                  {sub.description}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
