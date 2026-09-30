import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { SPRING, springLayoutTo } from "../../motion"
import { metrics } from "../../tokens"
import { clamp, hitSlopFor, range } from "../../utils"

/** Diameter of an inactive dot; the active pill is this wide times ACTIVE_WIDTH_RATIO. */
const DOT_SIZE = 8
const ACTIVE_WIDTH_RATIO = 2.5

export interface MobilePageDotsProps {
  /** Total number of pages. */
  count: number
  /**
   * Zero-based index of the current page. Values outside `[0, count - 1]` are
   * clamped so an over-swipe can never blank the indicator.
   */
  index: number
  /**
   * When provided, each dot becomes a button that jumps to its page. Without
   * it the indicator is read-only.
   */
  onPressDot?: (i: number) => void
  style?: ViewStyle
}

/**
 * MobilePageDots
 *
 * Carousel pager indicator: the active page is a wider pill, and dot widths
 * spring between states so paging feels physical. Width is a layout prop, so
 * those springs run on the JS driver — the same trade `MobileProgress` makes.
 *
 * Each dot's press target is the full 44pt row height rather than a `hitSlop`
 * halo, because horizontal slop on neighbouring dots would overlap and React
 * Native resolves that in favour of the last-drawn sibling.
 */
export function MobilePageDots({
  count,
  index,
  onPressDot,
  style,
}: MobilePageDotsProps) {
  const { colors } = useMobileTheme()
  const total = Math.max(0, Math.floor(count))
  const current = clamp(Math.floor(index), 0, Math.max(0, total - 1))

  // One animated width per dot, rebuilt when `count` changes and seeded at the
  // initial state so the first render never springs from zero.
  const widths = React.useMemo(
    () =>
      range(total).map((i) => new Animated.Value(i === current ? 1 : 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [total]
  )

  React.useEffect(() => {
    widths.forEach((anim, i) => {
      springLayoutTo(anim, i === current ? 1 : 0, SPRING).start()
    })
  }, [widths, current])

  if (total === 0) return null

  return (
    <View
      style={[styles.row, style]}
      accessibilityRole={onPressDot ? undefined : "summary"}
      accessibilityLabel={`Page ${current + 1} of ${total}`}
    >
      {widths.map((anim, i) => {
        const width = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [DOT_SIZE, DOT_SIZE * ACTIVE_WIDTH_RATIO],
          // A spring can overshoot; clamping keeps the pill from shrinking
          // back past the dot it replaced.
          extrapolateRight: "clamp",
        })
        const dot = (
          <Animated.View
            style={[
              styles.dot,
              {
                width,
                backgroundColor:
                  i === current ? colors.foreground : colors.inputBorder,
              },
            ]}
          />
        )
        return onPressDot ? (
          <Pressable
            key={i}
            onPress={() => onPressDot(i)}
            accessibilityRole="button"
            accessibilityLabel={`Go to page ${i + 1}`}
            accessibilityState={{ selected: i === current }}
            hitSlop={{ top: hitSlopFor(DOT_SIZE), bottom: hitSlopFor(DOT_SIZE) }}
            style={styles.hit}
          >
            {dot}
          </Pressable>
        ) : (
          <View key={i} style={styles.hit} pointerEvents="none">
            {dot}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: metrics.minTouchTarget,
    gap: 6,
  },
  // Full row height so the tappable area meets the 44pt minimum without
  // horizontal hitSlop bleeding into neighbouring dots.
  hit: {
    height: metrics.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
})
