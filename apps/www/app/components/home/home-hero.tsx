"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";

const smoothSpring = {
  type: "spring" as const,
  stiffness: 200,
  damping: 40,
  duration: 0.8,
  restDelta: 0.0001,
};

export function HomeHero() {
  const router = useRouter();
  const preloadGallery = () => {
    void router.prefetch("/docs/gallery");
  };

  return (
    <div className="flex max-w-[680px] flex-col gap-6">
      <motion.h1
        className="text-[28px] font-normal leading-[1.2] tracking-[-0.02em] text-foreground sm:text-[32px]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...smoothSpring, delay: 0.05 }}
      >
        Tool UI is the cleanest way to render JSON tool results as real
        components inside AI assistants.
      </motion.h1>

      <motion.div
        className="flex flex-wrap items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...smoothSpring, delay: 0.2 }}
      >
        <Button asChild size="lg" className="font-medium">
          <Link
            href="/docs/gallery"
            onMouseEnter={preloadGallery}
            onFocus={preloadGallery}
            onClick={() => analytics.cta.clicked("see_components", "home_hero")}
          >
            Browse components
            <ArrowRight className="size-4 shrink-0" />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="lg" className="font-medium">
          <Link
            href="/docs/overview"
            onClick={() => analytics.cta.clicked("read_docs", "home_hero")}
          >
            Read the docs
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
