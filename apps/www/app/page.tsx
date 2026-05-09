import { AnimatedHeaderFrame } from "@/app/components/layout/app-shell-animated.client";
import { ThemeToggle } from "@/app/components/builder/theme-toggle";
import { HomeHero } from "@/app/components/home/home-hero";
import { HomeBackground } from "@/app/components/home/home-background";
import { HomeFeatures } from "@/app/components/home/home-features";
import { HomeFinalCta } from "@/app/components/home/home-final-cta";
import { FauxChatShellMobileAnimated } from "@/app/components/home/faux-chat-shell-mobile-animated";
import { FauxChatShellAnimated } from "@/app/components/home/faux-chat-shell-animated";

export default function HomePage() {
  return (
    <AnimatedHeaderFrame
      rightContent={<ThemeToggle />}
      background={<HomeBackground />}
    >
      <main className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col px-4 py-10 sm:px-6 lg:px-10 lg:py-16">
        {/* Hero */}
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,500px)_1fr] lg:gap-16">
          <HomeHero />
          <div className="relative flex items-center justify-center">
            <div className="block h-[420px] w-full max-w-[430px] lg:hidden">
              <FauxChatShellMobileAnimated />
            </div>
            <div className="hidden h-[600px] w-full lg:block">
              <FauxChatShellAnimated />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-24 border-t border-border/40 pt-16 lg:mt-32">
          <p className="mb-8 text-[10px] font-medium tracking-widest text-muted-foreground/70 uppercase">
            What you get
          </p>
          <HomeFeatures />
        </section>

        {/* Final CTA */}
        <section className="mt-16 border-t border-border/40 lg:mt-24">
          <HomeFinalCta />
        </section>
      </main>
    </AnimatedHeaderFrame>
  );
}
