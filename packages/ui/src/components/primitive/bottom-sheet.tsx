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

/**
 * BottomSheet — opinionated Drawer for the common bottom-edge panel pattern.
 *
 * Defaults: swipe-down dismiss, visible drag handle. Pass `snapPoints` for
 * intermediate resting heights. Prefer this over raw `Drawer` when the panel
 * should always rise from the bottom; use `Sheet` for side panels without
 * swipe, and `Drawer` when you need other edges.
 */
function BottomSheet({
  showSwipeHandle = true,
  swipeDirection = "down",
  ...props
}: React.ComponentProps<typeof Drawer>) {
  return (
    <Drawer
      showSwipeHandle={showSwipeHandle}
      swipeDirection={swipeDirection}
      {...props}
    />
  )
}

const BottomSheetTrigger = DrawerTrigger
const BottomSheetClose = DrawerClose
const BottomSheetPortal = DrawerPortal
const BottomSheetOverlay = DrawerOverlay
const BottomSheetSwipeHandle = DrawerSwipeHandle
const BottomSheetContent = DrawerContent
const BottomSheetHeader = DrawerHeader
const BottomSheetFooter = DrawerFooter
const BottomSheetTitle = DrawerTitle
const BottomSheetDescription = DrawerDescription

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
  BottomSheetTrigger,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetBody,
  BottomSheetFooter,
  BottomSheetTitle,
  BottomSheetDescription,
}
