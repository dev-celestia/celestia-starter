import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native"
import { useMobileTheme } from "../../host"
import { SPRING_SNAPPY, springTo } from "../../motion"
import { clamp, hapticSelect, range } from "../../utils"
import { MobileText } from "./text"

export interface MobileRatingProps {
  /**
   * Current rating. Half values are rounded for display (3.5 → 4 filled).
   */
  value: number
  /**
   * Called with the star index (1-based) the user tapped. Omit with
   * `readOnly` for a pure display rating.
   */
  onChange?: (v: number) => void
  /**
   * Number of stars.
   * @default 5
   */
  max?: number
  /**
   * Star glyph size in points.
   * @default 24
   */
  size?: number
  /**
   * Display-only — no tap targets, no haptics.
   * @default false
   */
  readOnly?: boolean
}

/**
 * MobileRating
 *
 * Star rating drawn with unicode ★/☆ in `MobileText` — a star is one glyph,
 * so there is no reason to pull in an icon or vector dependency.
 *
 * Tapping a star fires a selection tick and reports its 1-based index; the
 * row springs a 1 → 1.12 → 1 pop whenever the *displayed* value changes, so
 * the commit is felt, not just seen (same pattern as MobileBadge).
 */
export function MobileRating({
  value,
  onChange,
  max = 5,
  size = 24,
  readOnly = false,
}: MobileRatingProps) {
  const { colors } = useMobileTheme()
  const displayValue = clamp(Math.round(value), 0, max)
  const interactive = !readOnly && Boolean(onChange)

  const pop = React.useRef(new Animated.Value(1)).current
  const prevValue = React.useRef(displayValue)

  React.useEffect(() => {
    if (prevValue.current === displayValue) return
    prevValue.current = displayValue
    // Two legs on purpose: punch to 1.12, then settle — the overshoot is the
    // confirmation feedback (same SNAPPY pop as MobileBadge).
    const anim = Animated.sequence([
      springTo(pop, 1.12, SPRING_SNAPPY),
      springTo(pop, 1, SPRING_SNAPPY),
    ])
    anim.start()
    return () => anim.stop()
  }, [displayValue, pop])

  const handleSelect = (star: number) => {
    if (!interactive) return
    hapticSelect()
    onChange?.(star)
  }

  const stars = range(max).map((index) => {
    const star = index + 1
    const glyph = (
      <MobileText
        key={`star-${index}`}
        style={{
          fontSize: size,
          lineHeight: size * 1.3,
          color: star <= displayValue ? colors.warning : colors.muted,
        }}
      >
        {star <= displayValue ? "★" : "☆"}
      </MobileText>
    )

    if (!interactive) return glyph

    return (
      <Pressable
        key={index}
        onPress={() => handleSelect(star)}
        accessibilityRole="button"
        accessibilityLabel={`Rate ${star} of ${max} stars`}
        // Vertical slop only; stars sit side by side and horizontal slop
        // would steal taps from neighbours.
        hitSlop={{ top: 8, bottom: 8, left: 0, right: 0 }}
        style={styles.star}
      >
        {glyph}
      </Pressable>
    )
  })

  return (
    <Animated.View
      style={[
        styles.row,
        { transform: [{ scale: pop }] },
      ]}
      accessibilityRole={readOnly ? "image" : undefined}
      accessibilityLabel={
        readOnly ? `Rated ${value} out of ${max} stars` : undefined
      }
    >
      {stars}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
  },
  star: {
    alignItems: "center",
    justifyContent: "center",
  },
})
