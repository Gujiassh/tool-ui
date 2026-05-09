import { AnimatedHeaderFrame } from "@/app/components/layout/app-shell-animated.client";
import { SiteFooter } from "@/app/components/layout/site-footer";
import { ThemeToggle } from "@/app/components/builder/theme-toggle";
import { HomeHero } from "@/app/components/home/home-hero";
import { HomeMockup } from "@/app/components/home/home-mockup";
import { HomeFeatures } from "@/app/components/home/home-features";
import { HomeFinalCta } from "@/app/components/home/home-final-cta";

export default function HomePage() {
  return (
    <AnimatedHeaderFrame rightContent={<ThemeToggle />}>
      <div className="flex w-full flex-1 flex-col">
        <main className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-6 py-14 lg:px-10 lg:py-20">
          {/* Hero */}
          <section>
            <HomeHero />
          </section>

          {/* Product mockup */}
          <section className="mt-12 lg:mt-16">
            <HomeMockup />
          </section>

          {/* Features */}
          <section className="mt-24 border-t border-border/30 pt-14 lg:mt-32">
            <p className="mb-10 text-[13.5px] font-medium text-foreground">
              What you get
            </p>
            <HomeFeatures />
          </section>

          {/* Final CTA */}
          <section className="mt-16 border-t border-border/30 lg:mt-24">
            <HomeFinalCta />
          </section>
        </main>

        <SiteFooter />
      </div>
    </AnimatedHeaderFrame>
  );
}
