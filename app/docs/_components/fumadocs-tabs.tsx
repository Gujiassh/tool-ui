"use client";

import * as React from "react";
import { cn } from "@/lib/ui/cn";
import {
  Tabs as UiTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface TabsProps extends React.ComponentProps<typeof UiTabs> {
  items?: string[];
  defaultIndex?: number;
}

export function Tabs({
  items,
  defaultIndex = 0,
  defaultValue,
  className,
  children,
  ...props
}: TabsProps) {
  const normalizedDefaultValue =
    defaultValue ??
    (items && items.length > 0
      ? items[Math.min(defaultIndex, items.length - 1)]
      : undefined);

  return (
    <UiTabs
      defaultValue={normalizedDefaultValue}
      className={cn("gap-4", className)}
      {...props}
    >
      {items && items.length > 0 ? (
        <TabsList>
          {items.map((item) => (
            <TabsTrigger key={item} value={item}>
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      ) : null}
      {children}
    </UiTabs>
  );
}

interface TabProps extends React.ComponentProps<typeof TabsContent> {
  value: string;
}

export function Tab({ value, children, ...props }: TabProps) {
  return (
    <TabsContent value={value} {...props}>
      {children}
    </TabsContent>
  );
}

export { TabsList, TabsTrigger, TabsContent };
