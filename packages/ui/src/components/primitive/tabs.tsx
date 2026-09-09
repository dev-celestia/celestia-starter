"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@celestia-project/ui/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-8 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent border-b border-border/50 group-data-[orientation=vertical]/tabs:border-b-0 group-data-[orientation=vertical]/tabs:border-e",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsIndicator({
  className,
  ...props
}: TabsPrimitive.Indicator.Props) {
  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(
        "pointer-events-none absolute z-0 transition-[left,top,width,height] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
        "top-[var(--active-tab-top)] left-[var(--active-tab-left)] w-[var(--active-tab-width)] h-[var(--active-tab-height)]",
        "group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:bg-background group-data-[variant=default]/tabs-list:shadow-xs dark:group-data-[variant=default]/tabs-list:border dark:group-data-[variant=default]/tabs-list:border-input/40 dark:group-data-[variant=default]/tabs-list:bg-input/30",
        "group-data-[variant=line]/tabs-list:rounded-full group-data-[variant=line]/tabs-list:bg-foreground group-data-[variant=line]/tabs-list:group-data-[orientation=horizontal]/tabs:top-auto group-data-[variant=line]/tabs-list:group-data-[orientation=horizontal]/tabs:bottom-0 group-data-[variant=line]/tabs-list:group-data-[orientation=horizontal]/tabs:h-0.5 group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:left-auto group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:end-0 group-data-[variant=line]/tabs-list:group-data-[orientation=vertical]/tabs:w-0.5",
        className
      )}
      {...props}
    />
  )
}

function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      <TabsIndicator />
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative z-10 inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2.5 py-1 text-xs font-medium whitespace-nowrap text-muted-foreground select-none outline-none",
        "transition-colors duration-150 ease-out hover:text-foreground",
        "active:scale-[0.97] active:duration-75 motion-reduce:active:scale-100",
        "data-active:text-foreground",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
        "group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start group-data-[orientation=vertical]/tabs:py-[calc(--spacing(1.25))]",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        "flex-1 text-xs/relaxed outline-none",
        "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.99] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsIndicator, tabsListVariants }

