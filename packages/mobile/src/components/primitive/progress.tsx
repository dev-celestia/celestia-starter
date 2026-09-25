import * as React from "react"
import {
  Animated,
  Easing,
  Platform,
  View,
  StyleSheet,
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import type { ColorRamp } from "../../tokens"
import { MobileText } from "./text"

export interface MobileProgressProps {
  /**
   * Completion in the range 0–1. Values outside the range are clamped.
   * Ignored when `indeterminate` is true.
   * @default 0
   */
  value?: number
  /**
   * Renders a travelling bar instead of a fixed fill, for unknown durations.
   * @default false
   */
  indeterminate?: boolean
  /**
   * Semantic fill colour, or a raw colour string.
   * @default 'primary'
   */
  color?: keyof ColorRamp | string
  /**
   * Semantic track colour, or a raw colour string.
   * @default 'mutedBackground'
   */
  trackColor?: keyof ColorRamp | string
  /**
   * Track thickness.
   * @default 6
   */
  height?: number
  /**
   * Optional caption rendered above the track.
   */
  label?: string
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

const INDETERMINATE_BAR_RATIO = 0.4
const INDETERMINATE_DURATION = 1100

/**
 * MobileProgress
 *
 * Determinate and indeterminate progress bar.
 *
 * The indeterminate bar animates `translateX` (a transform) rather than `width`,
 * so it can use the native driver and stay on the UI thread. That requires a
 * measured pixel track width, which is why the track reports its own layout.
 */
export function MobileProgress({
  value = 0,
  indeterminate = false,
  color = "primary",
  trackColor = "mutedBackground",
  height = 6,
  label,
  style,
}: MobileProgressProps) {
  const { colors } = useMobileTheme()
  const [trackWidth, setTrackWidth] = React.useState(0)
  const translateX = React.useRef(new Animated.Value(0)).current

  const resolve = (token: keyof ColorRamp | string) =>
    (token in colors ? colors[token as keyof ColorRamp] : token) as string

  const clamped = Math.min(1, Math.max(0, value))
  const barWidth = trackWidth * INDETERMINATE_BAR_RATIO

  React.useEffect(() => {
    if (!indeterminate || trackWidth === 0) return

    translateX.setValue(-barWidth)
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: trackWidth,
        duration: INDETERMINATE_DURATION,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== "web",
      })
    )
    loop.start()
    return () => loop.stop()
  }, [indeterminate, trackWidth, barWidth, translateX])

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width)
  }

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <MobileText variant="caption" color="muted">
            {label}
          </MobileText>
          {indeterminate ? null : (
            <MobileText variant="caption" color="muted" tabular>
              {`${Math.round(clamped * 100)}%`}
            </MobileText>
          )}
        </View>
      ) : null}

      <View
        onLayout={handleLayout}
        accessibilityRole="progressbar"
        accessibilityValue={
          indeterminate
            ? { min: 0, max: 100 }
            : { min: 0, max: 100, now: Math.round(clamped * 100) }
        }
        style={[
          styles.track,
          { height, borderRadius: height / 2, backgroundColor: resolve(trackColor) },
        ]}
      >
        {indeterminate ? (
          <Animated.View
            style={{
              width: barWidth,
              height: "100%",
              borderRadius: height / 2,
              backgroundColor: resolve(color),
              transform: [{ translateX }],
            }}
          />
        ) : (
          <View
            style={{
              width: `${clamped * 100}%`,
              height: "100%",
              borderRadius: height / 2,
              backgroundColor: resolve(color),
            }}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  track: {
    width: "100%",
    overflow: "hidden",
    minHeight: 2,
  },
})
