"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@celestia-project/ui/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@celestia-project/ui/components/dialog"
import {
  InputGroup,
  InputGroupAddon,
} from "@celestia-project/ui/components/input-group"
import { MagnifyingGlassIcon, CheckIcon } from "@phosphor-icons/react"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

function patchCmdkScroll(element: HTMLElement | null) {
  if (!element) return
  const items = element.querySelectorAll<HTMLElement>("[cmdk-item], [cmdk-group-heading]")
  items.forEach((item) => {
    if (!item.dataset.scrollPatched) {
      item.dataset.scrollPatched = "true"
      item.scrollIntoView = () => {
        const list = item.closest("[cmdk-list]") as HTMLElement | null
        if (list) {
          const listRect = list.getBoundingClientRect()
          const itemRect = item.getBoundingClientRect()
          if (itemRect.top < listRect.top) {
            list.scrollTop -= listRect.top - itemRect.top
          } else if (itemRect.bottom > listRect.bottom) {
            list.scrollTop += itemRect.bottom - listRect.bottom
          }
        }
      }
    }
  })
}

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  useIsomorphicLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    patchCmdkScroll(el)
    const observer = new MutationObserver(() => {
      patchCmdkScroll(el)
    })
    observer.observe(el, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return (
    <CommandPrimitive
      ref={containerRef}
      data-slot="command"
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-xl bg-popover p-1 text-popover-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  children: React.ReactNode
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0",
          className
        )}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  autoFocus = false,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="p-1 pb-0">
      <InputGroup className="h-8! bg-input/20 dark:bg-input/30">
        <CommandPrimitive.Input
          data-slot="command-input"
          autoFocus={autoFocus}
          className={cn(
            "w-full text-xs/relaxed outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          <MagnifyingGlassIcon className="size-3.5 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-xs/relaxed", className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 my-1 h-px bg-border/50", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      ref={(node: HTMLElement | null) => {
        if (node) {
          node.dataset.scrollPatched = "true"
          node.scrollIntoView = () => {
            const list = node.closest("[cmdk-list]") as HTMLElement | null
            if (list) {
              const listRect = list.getBoundingClientRect()
              const nodeRect = node.getBoundingClientRect()
              if (nodeRect.top < listRect.top) {
                list.scrollTop -= listRect.top - nodeRect.top
              } else if (nodeRect.bottom > listRect.bottom) {
                list.scrollTop += nodeRect.bottom - listRect.bottom
              }
            }
          }
        }
      }}
      data-slot="command-item"
      className={cn(
        "group/command-item relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-xs/relaxed outline-hidden select-none in-data-[slot=dialog-content]:rounded-md data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-selected:bg-muted data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 data-selected:*:[svg]:text-foreground",
        className
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ms-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ms-auto text-[0.625rem] tracking-widest text-muted-foreground group-data-selected/command-item:text-foreground",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
