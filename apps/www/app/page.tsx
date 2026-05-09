import { ThemeToggle } from "@/app/components/builder/theme-toggle";
import { HomeFeatures } from "@/app/components/home/home-features";
import { HomeFinalCta } from "@/app/components/home/home-final-cta";
import { HomeHero } from "@/app/components/home/home-hero";
import { HomeMockup } from "@/app/components/home/home-mockup";
import { AnimatedHeaderFrame } from "@/app/components/layout/app-shell-animated.client";
import { SiteFooter } from "@/app/components/layout/site-footer";

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
          <section className="mt-24 border-border/30 border-t pt-14 lg:mt-32">
            <p className="mb-10 font-medium text-[13.5px] text-foreground">
              What you get
            </p>
            <HomeFeatures />
          </section>

          {/* Final CTA */}
          <section className="mt-16 border-border/30 border-t lg:mt-24">
            <HomeFinalCta />
          </section>
        </main>

        <SiteFooter />
      </div>
    </AnimatedHeaderFrame>
  );
}
