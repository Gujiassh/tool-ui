"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

const apiKey = process.env["NEXT_PUBLIC_POSTHOG_API_KEY"];
const isDev = process.env.NODE_ENV === "development";
let didInit = false;

export function PostHogInit() {
  useEffect(() => {
    if (didInit || !apiKey) {
      return;
    }

    didInit = true;
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
  }, []);

  return null;
}
