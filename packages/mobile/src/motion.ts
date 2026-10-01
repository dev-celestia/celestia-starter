import * as React from "react"
import { Animated } from "react-native"

/**
 * Motion
 *
 * Centralised spring physics for the mobile design system.
 *
 * Before this module every component carried its own hand-tuned
 * `damping`/`stiffness` pair — nine distinct damping values and eleven
 * distinct stiffness values across the library, with the "house spring"
 * (18 / 1 / 320) retyped in full in a dozen files. The presets below are
 * the single source of truth; components import a name that describes the
 * *intent* of the motion (entrance, exit, press, gauge) rather than a
 * tuple of numbers, so the feel of the whole system can be tuned in one
 * place.
 *
 * Two families of helper ship alongside the presets:
 *
 * - `springTo` / `springLayoutTo` / `pressInTiming` — one-line wrappers
 *   for the three animation shapes, with the driver choice made here
 *   rather than repeated at every call site.
 * - `useSpringValue` / `usePressSpring` — hooks for the two patterns that
 *   appeared in nearly every interactive component: a value that chases a
 *   prop, and press feedback that dips on a short timing and springs back.
 */

/** The numeric half of an `Animated.spring` config. */
export interface SpringConfig {
  damping: number
  mass: number
  stiffness: number
}

/**
 * The house spring: crisp, with just enough overshoot to read as physical
 * without ever bouncing. The default for state changes — selection,
 * toggles, indicator travel.
 */
export const SPRING: SpringConfig = { damping: 18, mass: 1, stiffness: 320 }

/**
 * Softer and slower than the house spring. For motion that reveals layout
 * (height, collapse) where a tight spring would read as a jump-cut.
 */
export const SPRING_SOFT: SpringConfig = {
  damping: 22,
  mass: 1,
  stiffness: 260,
}

/**
 * Snappy with a visible pop. For marks of confirmation — the check tick,
 * the radio dot — where the overshoot IS the feedback.
 */
export const SPRING_SNAPPY: SpringConfig = {
  damping: 14,
  mass: 1,
  stiffness: 380,
}

/**
 * Underdamped: enters with a small overshoot, so new content arrives with
 * a little energy. Pair with SPRING_EXIT for the other half of the trip.
 */
export const SPRING_ENTRANCE: SpringConfig = {
  damping: 16,
  mass: 1,
  stiffness: 240,
}

/**
 * Overdamped: settles without bouncing back. Dismissals should feel
 * decisive, not elastic — nothing re-enters the frame to apologize.
 */
export const SPRING_EXIT: SpringConfig = {
  damping: 22,
  mass: 1,
  stiffness: 320,
}

/**
 * Heavily damped and slow. For gauges (progress fills) where overshoot
 * would misrepresent the value being reported.
 */
export const SPRING_GAUGE: SpringConfig = {
  damping: 20,
  mass: 1,
  stiffness: 120,
}

/**
 * Press-in is deliberately NOT a spring: the finger is already down, and
 * an overshoot under a held press reads as a wobble. A short fixed timing
 * gets the surface to its depressed position before the release spring
 * ever starts.
 */
export const PRESS_IN_DURATION = 90

/** Builds the full `Animated.spring` options object from a preset. */
export function springOptions(
  config: SpringConfig,
  toValue: number
): Animated.SpringAnimationConfig {
  return { toValue, ...config, useNativeDriver: true }
}

/** Springs `value` to `toValue` with `config` (default: the house spring). */
export function springTo(
  value: Animated.Value,
  toValue: number,
  config: SpringConfig = SPRING
): Animated.CompositeAnimation {
  return Animated.spring(value, springOptions(config, toValue))
}

/**
 * Springs a layout property (width, height) — these cannot ride the
 * native driver, so the JS driver is forced regardless of platform.
 */
export function springLayoutTo(
  value: Animated.Value,
  toValue: number,
  config: SpringConfig = SPRING_SOFT
): Animated.CompositeAnimation {
  return Animated.spring(value, { toValue, ...config, useNativeDriver: false })
}

/** The fixed-duration dip used for press-in feedback. */
export function pressInTiming(
  value: Animated.Value,
  toValue: number,
  duration: number = PRESS_IN_DURATION
): Animated.CompositeAnimation {
  return Animated.timing(value, {
    toValue,
    duration,
    useNativeDriver: true,
  })
}

/**
 * useSpringValue
 *
 * An `Animated.Value` seeded at `target` (so the first render never
 * springs from zero) that chases every subsequent change with `config`.
 * The declarative replacement for the useEffect + Animated.spring
 * boilerplate repeated across chip, switch, collapsible, and progress.
 */
export function useSpringValue(
  target: number,
  config: SpringConfig = SPRING
): Animated.Value {
  const value = React.useRef(new Animated.Value(target)).current
  React.useEffect(() => {
    springTo(value, target, config).start()
  }, [target, config, value])
  return value
}

/**
 * usePressSpring
 *
 * Press feedback as a hook: `onPressIn` dips the value to `pressed` on a
 * short timing, `onPressOut` springs it back to `rest`. Spread the
 * handlers onto a Pressable and bind `value` to whatever the press should
 * move (scale, translateY, opacity).
 *
 * The `rest`/`pressed` pair covers both idioms in the library — buttons
 * and FABs translate 0→2 on press, chips scale 1→0.96 — without the hook
 * needing to know which property it is driving.
 */
export function usePressSpring(
  rest: number,
  pressed: number,
  config: SpringConfig = SPRING
) {
  const value = React.useRef(new Animated.Value(rest)).current
  const onPressIn = React.useCallback(() => {
    pressInTiming(value, pressed).start()
  }, [value, pressed])
  const onPressOut = React.useCallback(() => {
    springTo(value, rest, config).start()
  }, [value, rest, config])
  return { value, onPressIn, onPressOut }
}
