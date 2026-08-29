"use client"

import * as React from "react"
import { cn } from "@celestia-project/ui/lib/utils"

type Line = {
  prompt?: boolean
  ok?: boolean
  text: string
}

const LINES: Line[] = [
  { prompt: true, text: "npx @celestia-project/create my-app" },
  { ok: true, text: "Cloning monorepo template" },
  { ok: true, text: "Features selected: auth, dashboard, blog" },
  { ok: true, text: "Dependencies installed in 42s" },
  { ok: true, text: "Environment files written" },
  { ok: true, text: "Database schema pushed" },
  { text: "Ready. cd my-app && pnpm dev", prompt: false },
]

/**
 * The scaffold session, shown as it actually runs. Lines fade in with
 * the role-fade-in keyframe when the terminal scrolls into view.
 */
export function InstallTerminal({ className }: Readonly<{ className?: string }>) {
  const ref = React.useRef<HTMLDivElement>(null)
  // idle: fully visible (default, no-JS). armed: lines hidden by CSS,
  // waiting for the terminal to scroll into view. started: staggered
  // role-fade-in plays. Hiding only ever happens client-side, motion
  // allowed — nothing ships blank.
  const [phase, setPhase] = React.useState<"idle" | "armed" | "started">("idle")

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      // Stay idle: every line is visible, no animation.
      return
    }

    let observer: IntersectionObserver | undefined
    // Arm after the first paint so the visible default ships first.
    const armTimer = window.setTimeout(() => {
      setPhase("armed")
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            setPhase("started")
            observer?.disconnect()
          }
        },
        { threshold: 0.35 },
      )
      observer.observe(node)
    }, 0)

    return () => {
      window.clearTimeout(armTimer)
      observer?.disconnect()
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "gradient-border animate-gradient-shift overflow-hidden rounded-xl",
        phase === "armed" && "terminal-armed",
        className,
      )}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-stroke bg-surface px-4 py-3">
        <span className="size-2.5 rounded-full bg-stroke" />
        <span className="size-2.5 rounded-full bg-stroke" />
        <span className="size-2.5 rounded-full bg-stroke" />
        <span className="ms-3 font-mono text-xs text-fog">
          celestia — zsh
        </span>
      </div>

      {/* Session */}
      <div className="terminal-session overflow-x-auto bg-surface p-5 font-mono text-[13px] leading-7 sm:p-6 sm:text-sm">
        {LINES.map((line) => (
          <p
            key={line.text}
            data-line
            className={cn(phase === "started" && "animate-role-fade-in")}
          >
            {line.prompt ? (
              <>
                <span className="text-fog">$ </span>
                <span className="text-text-primary">{line.text}</span>
              </>
            ) : (
              <>
                {line.ok !== false && (
                  <span className="me-2 inline-block text-[#89aacc]">✔</span>
                )}
                <span className={cn(line.ok ? "text-fog" : "text-text-primary")}>
                  {line.text}
                </span>
              </>
            )}
          </p>
        ))}
        <p
          aria-hidden
          data-line
          className={cn(
            "text-text-primary",
            phase === "started" && "animate-role-fade-in",
          )}
        >
          <span className="text-fog">$ </span>
          <span className="inline-block h-4 w-[7px] translate-y-[3px] accent-gradient animate-pulse" />
        </p>
      </div>
    </div>
  )
}
