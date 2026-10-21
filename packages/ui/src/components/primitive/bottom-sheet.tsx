"use client"

import * as React from "react"

import { cn } from "@celestia-project/ui/lib/utils"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerSwipeHandle,
  DrawerTitle,
  DrawerTrigger,
} from "@celestia-project/ui/primitive/drawer"

/** Half → full heights so the sheet can be dragged up and down. */
const DEFAULT_SNAP_POINTS = [0.5, 1] as const

/**
 * BottomSheet — opinionated Drawer for the common bottom-edge panel pattern.
 *
 * Defaults: swipe-down dismiss, visible drag knob, and snap points at 50% /
 * 100% so the sheet can be dragged up and down. Pass `snapPoints={[]}` to
 * disable snapping. Prefer this over raw `Drawer` for bottom panels; use
 * `Sheet` for side panels without swipe.
 */
function BottomSheet({
  showSwipeHandle = true,
  swipeDirection = "down",
  snapPoints = DEFAULT_SNAP_POINTS as unknown as React.ComponentProps<
    typeof Drawer
  >["snapPoints"],
  defaultSnapPoint,
  ...props
}: React.ComponentProps<typeof Drawer>) {
  const resolvedDefaultSnapPoint =
    defaultSnapPoint !== undefined
      ? defaultSnapPoint
      : snapPoints != null && snapPoints.length > 0
        ? snapPoints[0]
        : undefined

  return (
    <Drawer
      showSwipeHandle={showSwipeHandle}
      swipeDirection={swipeDirection}
      snapPoints={snapPoints}
      defaultSnapPoint={resolvedDefaultSnapPoint}
      {...props}
    />
  )
}

const BottomSheetTrigger = DrawerTrigger
const BottomSheetClose = DrawerClose
const BottomSheetPortal = DrawerPortal
const BottomSheetOverlay = DrawerOverlay
const BottomSheetSwipeHandle = DrawerSwipeHandle
const BottomSheetTitle = DrawerTitle
const BottomSheetDescription = DrawerDescription

/** Header stays in the gesture zone — drag from here to resize. */
function BottomSheetHeader({
  className,
  ...props
}: React.ComponentProps<typeof DrawerHeader>) {
  return (
    <DrawerHeader
      data-slot="bottom-sheet-header"
      className={cn("touch-none select-none", className)}
      {...props}
    />
  )
}

function BottomSheetFooter({
  className,
  ...props
}: React.ComponentProps<typeof DrawerFooter>) {
  return (
    <DrawerFooter
      data-slot="bottom-sheet-footer"
      className={cn("touch-none", className)}
      {...props}
    />
  )
}

/**
 * Drag knob — the pill at the top of the sheet that signals you can pull
 * up/down. Prefer leaving `showSwipeHandle` on so the built-in swipe hit-area
 * stays active; this is the visible indicator.
 */
function BottomSheetKnob({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bottom-sheet-knob"
      aria-hidden="true"
      className={cn(
        "mx-auto mt-1.5 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-foreground/30",
        className
      )}
      {...props}
    />
  )
}

/**
 * Panel chrome for snap-point sheets. The drag knob is rendered by
 * `showSwipeHandle` on the root (a pill at the top of the popup).
 */
function BottomSheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerContent>) {
  return (
    <DrawerContent className={cn(className)} {...props}>
      {children}
    </DrawerContent>
  )
}

/** Scrollable body between header and footer. */
function BottomSheetBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="bottom-sheet-body"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-4 py-2",
        className
      )}
      {...props}
    />
  )
}

export {
  BottomSheet,
  BottomSheetPortal,
  BottomSheetOverlay,
  BottomSheetSwipeHandle,
  BottomSheetKnob,
  BottomSheetTrigger,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetBody,
  BottomSheetFooter,
  BottomSheetTitle,
  BottomSheetDescription,
}
