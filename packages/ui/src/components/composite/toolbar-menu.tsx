"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@celestia-project/ui/lib/utils"
import { Separator } from "@celestia-project/ui/primitive/separator"

const toolbarMenuVariants = cva(
  "inline-flex w-fit items-center rounded-md border border-border/70 bg-background p-0.5 text-foreground",
  {
    variants: {
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col items-stretch",
      },
      size: {
        sm: "gap-0.5",
        default: "gap-0.5",
        lg: "gap-1",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      size: "default",
    },
  }
)

const toolbarMenuItemVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-sm border border-transparent text-muted-foreground outline-none transition-colors select-none hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      appearance: {
        icon: "",
        labeled: "gap-1.5",
      },
      orientation: {
        horizontal: "",
        vertical: "w-full justify-start",
      },
      size: {
        sm: "h-6 px-1.5 text-3xs [&_svg:not([class*='size-'])]:size-3",
        default: "h-7 px-2 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 px-2.5 text-sm [&_svg:not([class*='size-'])]:size-4",
      },
    },
    compoundVariants: [
      {
        appearance: "icon",
        size: "sm",
        className: "size-6 p-0",
      },
      {
        appearance: "icon",
        size: "default",
        className: "size-7 p-0",
      },
      {
        appearance: "icon",
        size: "lg",
        className: "size-9 p-0",
      },
      {
        appearance: "icon",
        orientation: "vertical",
        className: "w-auto self-center",
      },
    ],
    defaultVariants: {
      appearance: "icon",
      orientation: "horizontal",
      size: "default",
    },
  }
)

type ToolbarMenuAppearance = "icon" | "labeled"
type ToolbarMenuOrientation = "horizontal" | "vertical"
type ToolbarMenuSize = NonNullable<VariantProps<typeof toolbarMenuVariants>["size"]>

interface ToolbarMenuContextValue {
  appearance: ToolbarMenuAppearance
  orientation: ToolbarMenuOrientation
  size: ToolbarMenuSize
}

const ToolbarMenuContext = React.createContext<ToolbarMenuContextValue>({
  appearance: "icon",
  orientation: "horizontal",
  size: "default",
})

export interface ToolbarMenuItemData {
  id: string
  icon: React.ReactNode
  label?: React.ReactNode
  disabled?: boolean
  active?: boolean
  title?: string
  className?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

export interface ToolbarMenuProps
  extends Omit<React.ComponentProps<"div">, "onClick">,
    VariantProps<typeof toolbarMenuVariants> {
  /** Icon-only strip, or icon + visible label. */
  appearance?: ToolbarMenuAppearance
  /** Declarative items. Prefer this or children — not both for the same actions. */
  items?: ToolbarMenuItemData[]
  /** Fired for every item click (in addition to each item's own `onClick`). */
  onItemClick?: (
    item: ToolbarMenuItemData,
    event: React.MouseEvent<HTMLButtonElement>
  ) => void
}

function ToolbarMenu({
  className,
  orientation = "horizontal",
  appearance = "icon",
  size = "default",
  items,
  onItemClick,
  children,
  ...props
}: ToolbarMenuProps) {
  const resolvedOrientation = orientation ?? "horizontal"
  const resolvedSize = size ?? "default"
  const resolvedAppearance = appearance ?? "icon"

  return (
    <ToolbarMenuContext.Provider
      value={{
        appearance: resolvedAppearance,
        orientation: resolvedOrientation,
        size: resolvedSize,
      }}
    >
      <div
        role="toolbar"
        aria-orientation={resolvedOrientation}
        data-slot="toolbar-menu"
        data-orientation={resolvedOrientation}
        data-appearance={resolvedAppearance}
        data-size={resolvedSize}
        className={cn(
          toolbarMenuVariants({
            orientation: resolvedOrientation,
            size: resolvedSize,
          }),
          className
        )}
        {...props}
      >
        {items?.map((item) => (
          <ToolbarMenuItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            disabled={item.disabled}
            active={item.active}
            title={item.title}
            className={item.className}
            onClick={(event) => {
              item.onClick?.(event)
              if (!event.defaultPrevented) {
                onItemClick?.(item, event)
              }
            }}
          />
        ))}
        {children}
      </div>
    </ToolbarMenuContext.Provider>
  )
}

export interface ToolbarMenuItemProps
  extends Omit<React.ComponentProps<"button">, "children"> {
  icon: React.ReactNode
  label?: React.ReactNode
  active?: boolean
}

function ToolbarMenuItem({
  className,
  icon,
  label,
  active = false,
  disabled,
  title,
  type = "button",
  onClick,
  "aria-label": ariaLabel,
  ...props
}: ToolbarMenuItemProps) {
  const context = React.useContext(ToolbarMenuContext)
  const showLabel = context.appearance === "labeled" && label != null
  const accessibleName =
    typeof label === "string" ? label : title ?? ariaLabel

  return (
    <button
      type={type}
      data-slot="toolbar-menu-item"
      data-active={active || undefined}
      data-appearance={context.appearance}
      disabled={disabled}
      title={title ?? (typeof label === "string" ? label : undefined)}
      aria-label={showLabel ? ariaLabel : accessibleName}
      aria-pressed={active || undefined}
      className={cn(
        toolbarMenuItemVariants({
          appearance: context.appearance,
          orientation: context.orientation,
          size: context.size,
        }),
        className
      )}
      onClick={onClick}
      {...props}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center"
        aria-hidden={showLabel || undefined}
      >
        {icon}
      </span>
      {showLabel ? <span className="truncate font-medium">{label}</span> : null}
    </button>
  )
}

function ToolbarMenuSeparator({
  className,
  orientation,
  ...props
}: React.ComponentProps<typeof Separator>) {
  const context = React.useContext(ToolbarMenuContext)
  const resolvedOrientation =
    orientation ?? (context.orientation === "horizontal" ? "vertical" : "horizontal")

  return (
    <Separator
      data-slot="toolbar-menu-separator"
      orientation={resolvedOrientation}
      className={cn(
        "bg-border/80 data-[orientation=horizontal]:mx-0.5 data-[orientation=horizontal]:w-auto data-[orientation=vertical]:my-0.5 data-[orientation=vertical]:h-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  ToolbarMenu,
  ToolbarMenuItem,
  ToolbarMenuSeparator,
  toolbarMenuVariants,
  toolbarMenuItemVariants,
}
