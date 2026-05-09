"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { HomeHexnutScene } from "./home-hexnut-scene";
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
    <div className="flex flex-col gap-6">
      <motion.div
        className="-mb-2 -ml-4 flex w-fit items-end justify-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...smoothSpring, delay: 0.1 }}
      >
        <HomeHexnutScene />
      </motion.div>

      <div className="flex flex-col gap-3">
        <motion.h1
          className="text-5xl font-medium tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothSpring, delay: 0.1 }}
        >
          Tool UI
        </motion.h1>
        <motion.p
          className="text-xl tracking-tight text-foreground/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothSpring, delay: 0.3 }}
        >
          UI components for AI interfaces
        </motion.p>
      </div>

      <motion.p
        className="text-[15px] leading-[1.7] text-muted-foreground"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...smoothSpring, delay: 0.4 }}
      >
        JSON-native, typed, accessible, copy-pasteable. Built on Tailwind,
        Radix, and shadcn/ui. Open source.
      </motion.p>

      <motion.div
        className="flex flex-wrap items-center gap-3 pt-2"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...smoothSpring, delay: 0.5 }}
      >
        <Button asChild className="group font-medium" size="lg">
          <Link
            href="/docs/gallery"
            onMouseEnter={preloadGallery}
            onFocus={preloadGallery}
            onClick={() => analytics.cta.clicked("see_components", "home_hero")}
          >
            See the components
            <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
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
