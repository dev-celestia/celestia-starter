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

export type CalloutType =
  | "info"
  | "warn"
  | "warning"
  | "error"
  | "danger"
  | "success"
  | "tip"
  | "note"

export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: CalloutType
  title?: string
  icon?: React.ReactNode
}

/**
 * Callout tones map to the design system's status tokens, which carry a
 * different value per theme. The previous implementation used raw Tailwind
 * palette colours (`text-amber-500`, `border-rose-500/30`), which are tuned for
 * dark backgrounds and drop to ~2.2:1 on white.
 *
 * Every class below is a complete static string so Tailwind can see it — never
 * build these from a template literal.
 */
const TONES = {
  info: {
    icon: InfoIcon,
    iconClass: "text-info",
    container: "border-info/35 bg-info/[0.07]",
    title: "text-info",
  },
  success: {
    icon: CheckCircleIcon,
    iconClass: "text-success",
    container: "border-success/35 bg-success/[0.07]",
    title: "text-success",
  },
  warning: {
    icon: WarningIcon,
    iconClass: "text-warning",
    container: "border-warning/35 bg-warning/[0.07]",
    title: "text-warning",
  },
  danger: {
    icon: WarningCircleIcon,
    iconClass: "text-destructive",
    container: "border-destructive/35 bg-destructive/[0.07]",
    title: "text-destructive",
  },
} as const

const TYPE_TO_TONE: Record<CalloutType, keyof typeof TONES> = {
  note: "info",
  info: "info",
  tip: "success",
  success: "success",
  warn: "warning",
  warning: "warning",
  error: "danger",
  danger: "danger",
}

export function Callout({
  type = "info",
  title,
  icon,
  className,
  children,
  ...props
}: CalloutProps) {
  const tone = TONES[TYPE_TO_TONE[type]]
  const Icon = tone.icon

  return (
    <div
      data-callout={type}
      className={cn(
        "my-5 flex gap-3 rounded-xl border p-4 text-xs leading-relaxed shadow-xs backdrop-blur-xs",
        tone.container,
        className
      )}
      {...props}
    >
      <div className="mt-0.5 shrink-0">
        {icon ?? <Icon className={cn("size-4", tone.iconClass)} weight="fill" />}
      </div>
      <div className="min-w-0 flex-1">
        {title && (
          <div className={cn("mb-1 font-medium", tone.title)}>{title}</div>
        )}
        {/* Body stays on the muted foreground so long prose keeps a consistent
            reading colour; the tone is carried by the border, the tint and the
            title instead. */}
        <div className="font-normal text-muted-foreground [&>p]:m-0">
          {children}
        </div>
      </div>
    </div>
  )
}
