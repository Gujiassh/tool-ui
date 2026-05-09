"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/ui/cn";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  function changeTheme(newTheme: string) {
    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.documentElement.dataset.themeTransition = "";
    const transition = document.startViewTransition(() => {
      setTheme(newTheme);
    });
    transition.finished.then(() => {
      delete document.documentElement.dataset.themeTransition;
    });
  }

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    changeTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className="relative"
      onClick={toggleTheme}
    >
      <Sun
        className={cn(
          "size-4 transition-all",
          isDark ? "rotate-90 scale-0" : "rotate-0 scale-100",
        )}
      />
      <Moon
        className={cn(
          "absolute size-4 transition-all",
          isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0",
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
