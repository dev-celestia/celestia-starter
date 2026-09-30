import { Children, isValidElement, type ReactNode } from "react"
import * as Haptics from "expo-haptics"
import { metrics } from "./tokens"

/**
 * Returns `true` when `children` is content that **must** be wrapped in a
 * `<Text>` component on React Native: a string, a number, or an array whose
 * every entry is a string or a number.
 *
 * Returns `false` for everything else — `null`, `undefined` and booleans (all
 * of which render nothing), and any React element, because an element either
 * supplies its own `<Text>` wrapper or is a `<View>` that cannot be nested
 * inside `<Text>`.
 *
 * This exists because JSX produces an **array** whenever an element has more
 * than one child: `+{count}%` compiles to `["+", count, "%"]`. Neither check it
 * replaces can tell the two shapes apart:
 *
 * - `typeof children === "string"` is `false` for that array, so the strings
 *   were rendered as direct children of a `<View>` — which React Native rejects
 *   ("Text strings must be rendered within a `<Text>` component").
 * - `React.isValidElement(children)` is also `false` for that array, so the
 *   array was nested inside `<Text>` instead — which crashes as soon as it
 *   contains a `<View>`, e.g. an icon passed as one of several children.
 *
 * Caveat: a *mixed* array — text alongside an element, as in `<Icon/> Sign in`
 * — returns `false`, so the caller renders it as-is. Wrap each text run in
 * `<MobileText>` explicitly in that case.
 */
export function isTextChildren(children: ReactNode): boolean {
  if (children == null || typeof children === "boolean") return false
  if (typeof children === "string" || typeof children === "number") return true
  if (Array.isArray(children)) {
    return Children.toArray(children).every(
      (child) => typeof child === "string" || typeof child === "number"
    )
  }
  // Any React element means the caller already composed its own content.
  return !isValidElement(children)
}

/** Clamps `value` into `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** `[0, 1, …, count - 1]` — for keys and stagger indices, not general iteration. */
export function range(count: number): number[] {
  return Array.from({ length: Math.max(0, Math.floor(count)) }, (_, i) => i)
}

/** Splits `items` into arrays of at most `size`. `size < 1` yields `[]`. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size < 1) return []
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size))
  }
  return out
}

/** Truncates to `max` characters, adding an ellipsis only when it cuts. */
export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1))}…`
}

/** Up to two uppercase initials: `"Ada Lovelace"` → `"AL"`, `"ada"` → `"A"`. */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

/** `1200` → `"1.2K"`, `3_400_000` → `"3.4M"`. Below 1000, the plain number. */
export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return "—"
  const abs = Math.abs(value)
  const sign = value < 0 ? "-" : ""
  if (abs >= 1e9) return `${sign}${trimZero(abs / 1e9)}B`
  if (abs >= 1e6) return `${sign}${trimZero(abs / 1e6)}M`
  if (abs >= 1e3) return `${sign}${trimZero(abs / 1e3)}K`
  return String(value)
}

function trimZero(n: number): string {
  return (Math.round(n * 10) / 10).toString()
}

/**
 * Coarse relative time: `"just now"`, `"5m ago"`, `"in 3d"`. Deliberately
 * coarse — a phone screen has no room for a full date, and Intl.RelativeTimeFormat
 * is not available in every Hermes build.
 */
export function formatRelativeTime(date: Date, now: number = Date.now()): string {
  const diffMs = date.getTime() - now
  const future = diffMs > 0
  const s = Math.round(Math.abs(diffMs) / 1000)
  if (s < 45) return "just now"
  const m = Math.round(s / 60)
  if (m < 60) return future ? `in ${m}m` : `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return future ? `in ${h}h` : `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 30) return future ? `in ${d}d` : `${d}d ago`
  const mo = Math.round(d / 30)
  if (mo < 12) return future ? `in ${mo}mo` : `${mo}mo ago`
  const y = Math.round(mo / 12)
  return future ? `in ${y}y` : `${y}y ago`
}

/**
 * Vertical `hitSlop` that lifts a control of `height` to the 44pt minimum touch
 * target. Vertical only — horizontal slop bleeds into siblings, and React
 * Native resolves the overlap in favour of the last-drawn one.
 */
export function hitSlopFor(height: number): number {
  return Math.max(0, Math.ceil((metrics.minTouchTarget - height) / 2))
}

// Fire-and-forget haptics. Every component in this package wants the same
// three calls with the same swallowed rejection, so the boilerplate lives here.

/** Light impact — normal press commits. */
export function hapticLight(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
}

/** Medium impact — destructive or heavy commits. */
export function hapticMedium(): void {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
}

/** Selection tick — toggles, pickers, value changes. */
export function hapticSelect(): void {
  Haptics.selectionAsync().catch(() => {})
}
