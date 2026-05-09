import "./styles/globals.css";
import "leaflet/dist/leaflet.css";
import { Analytics } from "@vercel/analytics/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { ReactNode } from "react";
import { PostHogInit } from "@/app/components/analytics/posthog-init.client";
import { MobileNavSheetGate } from "@/app/components/layout/mobile-nav-sheet-gate.client";
import { ThemeProvider } from "@/app/components/theme/theme-provider";

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
      className={`${GeistSans.variable} ${GeistMono.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="overscroll-none bg-background">
        <div id="app-root" className="flex min-h-screen flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            {children}
            <MobileNavSheetGate />
            <PostHogInit />
            <Analytics />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
