"use client"
 
import * as React from "react"
import { cn } from "../lib/utils"

export interface RippleItem {
  id: number | string
  x: number
  y: number
  size: number
}

export type RippleProps = RippleItem

export interface UseRippleOptions {
  disabled?: boolean
  color?: string
  duration?: number
}

export function useRipple(options: UseRippleOptions = {}) {
  const { disabled = false, duration = 600 } = options
  const [ripples, setRipples] = React.useState<RippleItem[]>([])

  const addRipple = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) return

      const element = event.currentTarget
      const rect = element.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 2
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2
      const id = Date.now() + Math.random()

      const newRipple: RippleItem = { id, x, y, size }
      setRipples((prev) => [...prev, newRipple])

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, duration)
    },
    [disabled, duration]
  )

  return { ripples, addRipple }
}

export interface RippleContainerProps {
  ripples: RippleItem[]
  color?: string
  duration?: number
  className?: string
}

export function RippleContainer({
  ripples,
  color = "currentColor",
  duration = 600,
  className,
}: RippleContainerProps) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]",
        className
      )}
      aria-hidden="true"
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </span>
  )
}

export function useGlobalRipple(options: UseRippleOptions = {}) {
  const { disabled = false, color = "rgba(255, 255, 255, 0.4)", duration = 500 } = options

  React.useEffect(() => {
    if (disabled) return

    const handleClick = (event: MouseEvent) => {
      const ripple = document.createElement("span")
      const size = 20
      const x = event.clientX - size / 2
      const y = event.clientY - size / 2

      ripple.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 99999;
        animation: globalRipple ${duration}ms ease-out forwards;
      `

      document.body.appendChild(ripple)

      setTimeout(() => {
        ripple.remove()
      }, duration)
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [disabled, color, duration])
}

if (typeof document !== "undefined") {
  const styleId = "celestia-ripple-styles"
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      @keyframes ripple {
        0% {
          transform: scale(0);
          opacity: 0.45;
        }
        100% {
          transform: scale(1);
          opacity: 0;
        }
      }
      @keyframes globalRipple {
        0% {
          transform: scale(1);
          opacity: 0.6;
        }
        100% {
          transform: scale(4);
          opacity: 0;
        }
      }
      .animate-ripple {
        animation: ripple 600ms cubic-bezier(0, 0, 0.2, 1) forwards;
      }
    `
    document.head.appendChild(style)
  }
}

