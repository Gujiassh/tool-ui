import "./styles/globals.css";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { PostHogInit } from "@/app/components/analytics/posthog-init.client";
import { ThemeProvider } from "@/app/components/theme/theme-provider";
import { MobileNavSheetGate } from "@/app/components/layout/mobile-nav-sheet-gate.client";

const isProduction = process.env.NODE_ENV === "production";
const title = isProduction ? "Tool UI" : "Tool UI — Dev";
const description = "UI components for AI interfaces";

export const metadata = {
  title,
  description,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background overscroll-none">
        <div id="app-root" className="flex h-screen h-svh flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            {children}
            <MobileNavSheetGate />
            <PostHogInit />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
