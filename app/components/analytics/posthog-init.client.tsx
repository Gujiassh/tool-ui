"use client";

import { useEffect } from "react";

const apiKey = process.env["NEXT_PUBLIC_POSTHOG_API_KEY"];
const isDev = process.env.NODE_ENV === "development";
let didInit = false;
let initPromise: Promise<void> | null = null;

export function PostHogInit() {
  useEffect(() => {
    if (didInit || initPromise || !apiKey) {
      return;
    }

    initPromise = (async () => {
      const { default: posthog } = await import("posthog-js");
      if (didInit) {
        return;
      }

      posthog.init(apiKey, {
        api_host: "/ph",
        ui_host: "https://us.posthog.com",
        defaults: "2025-11-30",
        capture_exceptions: true,
        advanced_disable_flags: true, // Skip feature flags API call
        loaded: (instance) => {
          // Tag all events with environment for filtering.
          instance.register({
            environment: isDev ? "development" : "production",
            app: "tool-ui",
          });
        },
      });

      didInit = true;
    })()
      .catch((error) => {
        if (isDev) {
          console.error("[PostHog] failed to initialize", error);
        }
      })
      .finally(() => {
        initPromise = null;
      });
  }, []);

  return null;
}
