import * as React from "react"

/**
 * Boolean state with a stable toggle. `[value, toggle, setValue]`.
 */
export function useToggle(
  initial = false
): [boolean, () => void, (next: boolean) => void] {
  const [value, setValue] = React.useState(initial)
  const toggle = React.useCallback(() => setValue((v) => !v), [])
  return [value, toggle, setValue]
}

/**
 * Returns `value` after it has stopped changing for `delayMs`. For search
 * fields and anything else that would otherwise hit an API per keystroke.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}

export interface UseCountdownResult {
  /** Whole seconds remaining. */
  remaining: number
  /** True while the countdown is ticking. */
  isRunning: boolean
  /** (Re)start from `seconds`, or from an explicit override. */
  start: (seconds?: number) => void
}

/**
 * One-second countdown for resend timers and OTP expiry.
 *
 * Starts automatically when `autoStart` (default). Re-renders once per second
 * only while running — a finished countdown is inert.
 */
export function useCountdown(
  seconds: number,
  { autoStart = true }: { autoStart?: boolean } = {}
): UseCountdownResult {
  const [remaining, setRemaining] = React.useState(autoStart ? seconds : 0)
  const isRunning = remaining > 0

  React.useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => clearInterval(id)
  }, [isRunning])

  const start = React.useCallback(
    (override?: number) => setRemaining(override ?? seconds),
    [seconds]
  )

  return { remaining, isRunning, start }
}
