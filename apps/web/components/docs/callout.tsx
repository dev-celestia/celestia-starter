"use client"

import * as React from "react"
import {
  InfoIcon,
  WarningIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  LightbulbIcon,
} from "@phosphor-icons/react"
import { cn } from "@celestia-project/ui/lib/utils"

export type CalloutType = "info" | "warn" | "warning" | "error" | "danger" | "success" | "tip" | "note"

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: CalloutType
  title?: string
  icon?: React.ReactNode
}

export function Callout({
  type = "info",
  title,
  icon,
  className,
  children,
  ...props
}: CalloutProps) {
  const getIcon = () => {
    if (icon) return icon
    switch (type) {
      case "warn":
      case "warning":
        return <WarningIcon className="size-4 text-amber-500 shrink-0" weight="fill" />
      case "error":
      case "danger":
        return <WarningCircleIcon className="size-4 text-rose-500 shrink-0" weight="fill" />
      case "success":
        return <CheckCircleIcon className="size-4 text-emerald-500 shrink-0" weight="fill" />
      case "tip":
        return <LightbulbIcon className="size-4 text-yellow-500 shrink-0" weight="fill" />
      case "note":
      case "info":
      default:
        return <InfoIcon className="size-4 text-blue-500 shrink-0" weight="fill" />
    }
  }

  const getVariantStyles = () => {
    switch (type) {
      case "warn":
      case "warning":
        return "border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200"
      case "error":
      case "danger":
        return "border-rose-500/30 bg-rose-500/5 text-rose-900 dark:text-rose-200"
      case "success":
        return "border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200"
      case "tip":
        return "border-yellow-500/30 bg-yellow-500/5 text-yellow-900 dark:text-yellow-200"
      case "note":
      case "info":
      default:
        return "border-blue-500/30 bg-blue-500/5 text-blue-900 dark:text-blue-200"
    }
  }

  return (
    <div
      className={cn(
        "my-5 flex gap-3 rounded-xl border p-4 text-xs leading-relaxed transition-all shadow-xs backdrop-blur-xs",
        getVariantStyles(),
        className
      )}
      {...props}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        {title && <div className="text-foreground mb-1">{title}</div>}
        <div className="text-muted-foreground/90 font-normal [&>p]:m-0">{children}</div>
      </div>
    </div>
  )
}
