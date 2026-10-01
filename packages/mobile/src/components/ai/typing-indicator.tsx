import * as React from "react"
import { Animated, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileText } from "../primitive/text"

export interface MobileTypingIndicatorProps {
  /**
   * Optional caption beside the dots, e.g. "Thinking…" or "Searching the web".
   * Omit for the bare three-dot bubble.
   */
  label?: string
  /**
   * Renders on the assistant surface with a bubble outline, matching
   * `MobileAiMessage`'s assistant turn.
   * @default true
   */
  bubble?: boolean
  /**
   * Screen-reader announcement. Defaults to `label`, then to "Assistant is
   * responding".
   */
  accessibilityLabel?: string
  /**
   * Optional style override for the container.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const DOT_SIZE = 6
/** One dot's rise-and-fall. */
const DOT_MS = 320
/** Gap between neighbouring dots, so the wave reads left-to-right. */
const STAGGER_MS = 160

/**
 * MobileTypingIndicator
 *
 * The "assistant is working" mark: three dots rising in a staggered wave.
 *
 * Each dot owns its own loop rather than sharing one driven value. A shared
 * value would need the stagger baked into an interpolation range, which breaks
 * the moment the dot count changes; three independent loops keep the cycle
 * length identical (320 + 160 twice) so the wave never drifts out of phase.
 *
 * `translateY` and `opacity` are both transform-free/native-driver-safe, so the
 * whole animation stays off the JS thread — important, because this renders
 * exactly when the network is busy.
 */
export function MobileTypingIndicator({
  label,
  bubble = true,
  accessibilityLabel,
  style,
  testID,
}: MobileTypingIndicatorProps) {
  const { colors } = useMobileTheme()

  const dot1 = React.useRef(new Animated.Value(0)).current
  const dot2 = React.useRef(new Animated.Value(0)).current
  const dot3 = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    const dots = [dot1, dot2, dot3]
    const loops = dots.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * STAGGER_MS),
          Animated.timing(value, {
            toValue: 1,
            duration: DOT_MS,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: DOT_MS,
            useNativeDriver: true,
          }),
          Animated.delay((dots.length - 1 - index) * STAGGER_MS),
        ])
      )
    )
    loops.forEach((loop) => loop.start())
    return () => loops.forEach((loop) => loop.stop())
  }, [dot1, dot2, dot3])

  const dotStyle = (value: Animated.Value) => ({
    opacity: value.interpolate({
      inputRange: [0, 1],
      outputRange: [0.35, 1],
    }),
    transform: [
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  })

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={
        accessibilityLabel ?? label ?? "Assistant is responding"
      }
      style={[
        styles.row,
        bubble
          ? {
              backgroundColor: colors.surface,
              borderColor: colors.cardBorder,
              borderWidth: 1,
              borderRadius: metrics.radius.lg,
            }
          : null,
        style,
      ]}
    >
      <View style={styles.dots}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: colors.muted },
            dotStyle(dot1),
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: colors.muted },
            dotStyle(dot2),
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: colors.muted },
            dotStyle(dot3),
          ]}
        />
      </View>

      {label ? (
        <MobileText variant="callout" color="muted">
          {label}
        </MobileText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
})
