"use client"

import * as React from "react"
import {
  DownloadSimpleIcon,
  UploadSimpleIcon,
  WarningIcon,
} from "@phosphor-icons/react"

import { cn } from "@celestia-project/ui/lib/utils"

type DropZoneState = "idle" | "hover" | "active" | "error"

function DropZone({
  className,
  state: forcedState,
  title = "Drop files here",
  description = "or click to browse",
  disabled,
  accept,
  multiple = true,
  onFiles,
  onClick,
  ...props
}: Omit<React.ComponentProps<"div">, "onDrop"> & {
  state?: DropZoneState
  title?: string
  description?: string
  disabled?: boolean
  accept?: string
  multiple?: boolean
  onFiles?: (files: File[]) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)

  const visual: DropZoneState =
    forcedState ?? (dragging ? "active" : "idle")

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    setDragging(true)
  }

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDragging(false)
    }
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return
    event.preventDefault()
    setDragging(false)
    const files = Array.from(event.dataTransfer.files ?? [])
    if (files.length) onFiles?.(files)
  }

  const Icon =
    visual === "error"
      ? WarningIcon
      : visual === "active"
        ? DownloadSimpleIcon
        : UploadSimpleIcon

  return (
    <div
      data-slot="drop-zone"
      data-state={visual}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={(event) => {
        if (disabled) return
        onClick?.(event)
        if (!event.defaultPrevented) inputRef.current?.click()
      }}
      onKeyDown={(event) => {
        if (disabled) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          inputRef.current?.click()
        }
      }}
      className={cn(
        "flex min-h-[140px] w-full flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed px-6 py-7 text-center transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring",
        visual === "idle" && "border-border bg-muted/35 text-muted-foreground",
        visual === "hover" && "border-primary/50 bg-primary/5 text-primary",
        visual === "active" && "border-primary bg-primary/10 text-primary",
        visual === "error" && "border-destructive/50 bg-destructive/5 text-destructive",
        disabled && "pointer-events-none opacity-50",
        !disabled && "cursor-pointer",
        className
      )}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        tabIndex={-1}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length) onFiles?.(files)
          event.target.value = ""
        }}
      />
      <Icon className="size-7" weight="duotone" />
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {description ? (
        <div className="text-xs text-muted-foreground">{description}</div>
      ) : null}
    </div>
  )
}

export { DropZone, type DropZoneState }
