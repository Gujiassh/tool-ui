"use client";

import { motion } from "motion/react";
import { FauxChatShellNoLightOverlay } from "./faux-chat-shell";
import { FauxChatShellMobile } from "./faux-chat-shell-mobile";

export function HomeMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full"
    >
      {/* Soft glow under the mockup */}
      <div
        className="pointer-events-none absolute inset-x-0 -bottom-12 -z-10 h-32 bg-[radial-gradient(ellipse_at_center,_oklch(0_0_0_/_0.08),_transparent_70%)] blur-2xl dark:bg-[radial-gradient(ellipse_at_center,_oklch(1_0_0_/_0.04),_transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto h-[460px] w-full max-w-[1100px] sm:h-[540px] lg:h-[620px]">
        <div className="absolute inset-0 hidden lg:block">
          <FauxChatShellNoLightOverlay />
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4 lg:hidden">
          <div className="h-full w-full max-w-[420px]">
            <FauxChatShellMobile />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
