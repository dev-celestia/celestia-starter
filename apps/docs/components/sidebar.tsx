"use client";

import type * as PageTree from "fumadocs-core/page-tree";
import {
  SidebarItem,
  SidebarSeparator,
} from "fumadocs-ui/components/sidebar/base";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * Enhanced sidebar item — same link behaviour as the default, plus:
 * an accent bar + tinted background on the active page, and a smoother hover transition.
 */
export function EnhancedSidebarItem({
  item,
}: Readonly<{ item: PageTree.Item }>) {
  const pathname = usePathname();
  const active = pathname === item.url;

  return (
    <SidebarItem
      href={item.url}
      active={active}
      className={cn(
        "flex pl-2 gap-2 items-center p-2 relative rounded-md transition-colors duration-150",
        active
          ? "bg-fd-primary/10 text-primary font-medium"
          : "text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="bg-fd-primary absolute inset-y-1.5 left-0 w-0.5 rounded-full"
        />
      )}
      {item.name}
    </SidebarItem>
  );
}

/**
 * Enhanced separator — a small brand dot before the section label.
 */
export function EnhancedSidebarSeparator({
  item,
}: Readonly<{ item: PageTree.Separator }>) {
  return (
    <SidebarSeparator className="text-muted-foreground mt-10 mb-2 px-2 text-[11px] tracking-wide uppercase">
      {item.name}
    </SidebarSeparator>
  );
}

export const sidebarComponents = {
  Item: EnhancedSidebarItem,
  Separator: EnhancedSidebarSeparator,
};
