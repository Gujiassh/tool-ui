"use client";

import { InstallCommandBlock } from "./install-command-block";

interface InstallCommandLineProps {
  componentId: string;
  className?: string;
}

export function InstallCommandLine({
  componentId,
  className,
}: InstallCommandLineProps) {
  return (
    <InstallCommandBlock
      componentId={componentId}
      className={className}
      variant="compact"
    />
  );
}
