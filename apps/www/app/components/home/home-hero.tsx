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
  const preloadBuilder = () => {
    void router.prefetch("/builder");
  };

  return (
    <div className="flex flex-col gap-7">
      <motion.div
        className="-mb-4 -ml-4 flex items-end justify-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...smoothSpring, delay: 0.1 }}
      >
        <HomeHexnutScene />
      </motion.div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3">
          <motion.h1
            className="text-6xl font-bold tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothSpring, delay: 0.1 }}
          >
            Tool UI
          </motion.h1>
        </div>
        <motion.h2
          className="text-2xl text-pretty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothSpring, delay: 0.3 }}
        >
          UI components for AI interfaces
        </motion.h2>
      </div>
      <motion.p
        className="text-muted-foreground mb-2 text-lg text-pretty"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...smoothSpring, delay: 0.4 }}
      >
        JSON-native, typed, accessible, copy-pasteable.{" "}
        <br className="hidden md:block" />
        Built on Tailwind, Radix, and shadcn/ui. Open Source.
      </motion.p>
      <motion.div
        className="flex flex-wrap items-center gap-3"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...smoothSpring, delay: 0.5 }}
      >
        <Button
          asChild
          className="group font-medium tracking-wide"
          size="homeCTA"
        >
          <Link
            href="/docs/gallery"
            onMouseEnter={preloadGallery}
            onFocus={preloadGallery}
            onClick={() => analytics.cta.clicked("see_components", "home_hero")}
          >
            View Component Gallery
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="group border-2 font-medium tracking-wide"
          size="homeCTA"
        >
          <Link
            href="/builder"
            onMouseEnter={preloadBuilder}
            onFocus={preloadBuilder}
            onClick={() =>
              analytics.cta.clicked("create_tool_ui", "home_hero")
            }
          >
            Create your own Tool UI
            <ArrowRight
              className="size-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </Button>
      </motion.div>
    </div>
  );
}
