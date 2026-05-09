import type { ReactNode } from "react";
import { ThemeToggle } from "@/app/components/builder/theme-toggle";
import { HeaderFrame } from "@/app/components/layout/app-shell";
import ContentLayout from "@/app/components/layout/page-shell";

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <HeaderFrame rightContent={<ThemeToggle />}>
      <ContentLayout>{children}</ContentLayout>
    </HeaderFrame>
  );
}
