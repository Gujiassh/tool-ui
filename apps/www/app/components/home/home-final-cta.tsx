"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import { SITE_LINKS } from "@/lib/site-config";

export function HomeFinalCta() {
  return (
    <div className="flex flex-col items-center gap-5 py-16 text-center">
      <h2 className="font-medium text-2xl text-foreground tracking-tight md:text-3xl">
        Render JSON, not data dumps.
      </h2>
      <p className="max-w-md text-[14px] text-muted-foreground leading-[1.7]">
        Browse the gallery, copy what you need, ship better assistant interfaces
        today.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button asChild className="group" size="lg">
          <Link
            href="/docs/gallery"
            onClick={() =>
              analytics.cta.clicked("see_components", "home_footer")
            }
          >
            Browse the gallery
            <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a
            href={SITE_LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.cta.clicked("github_star", "home_footer")}
          >
            Star on GitHub
          </a>
        </Button>
      </div>
    </div>
  );
}
