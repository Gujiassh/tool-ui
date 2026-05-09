"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/ui/cn";

interface ActiveNavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function ActiveNavLink({ href, children }: ActiveNavLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-2.5 py-1 text-sm transition-colors",
        isActive
          ? "font-medium text-brand"
          : "text-muted-foreground hover:text-foreground",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
