import * as React from "react"
import { Animated, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics, type ColorRamp } from "../../tokens"
import { clamp } from "../../utils"

export interface MobileAudioWaveformProps {
  /**
   * Static bar levels in the range 0–1. Ignored while `active`, which drives a
   * synthetic wave instead.
   */
  levels?: number[]
  /**
   * Animates the bars. Use while recording or playing.
   * @default false
   */
  active?: boolean
  /**
   * Bar count when `levels` is not supplied.
   * @default 28
   */
  bars?: number
  /**
   * Waveform height in points.
   * @default 36
   */
  height?: number
  /**
   * Playback progress in the range 0–1. Bars before the playhead take `color`,
   * the rest take `trackColor`. Omit for a single-colour waveform.
   */
  progress?: number
  /**
   * Played / active bar colour.
   * @default 'primary'
   */
  color?: keyof ColorRamp | string
  /**
   * Unplayed bar colour.
   * @default 'mutedBackground'
   */
  trackColor?: keyof ColorRamp | string
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const BAR_WIDTH = 3
const BAR_GAP = 3
/** Resting scale of a bar — never zero, or the waveform looks broken. */
const MIN_SCALE = 0.18

function resolveColor(
  colors: ColorRamp,
  color: keyof ColorRamp | string
): string {
  return (color in colors ? colors[color as keyof ColorRamp] : color) as string
}

/**
 * MobileAudioWaveform
 *
 * The voice waveform used while recording and while playing back a spoken
 * answer.
 *
 * Bars are **fixed-height and `scaleY`-animated**, growing from the centre.
 * Animating `height` instead would be a layout prop — no native driver, and a
 * relayout of every bar on every frame. Scaling around the centre also produces
 * the symmetric silhouette a voice waveform is expected to have.
 *
 * Each bar owns its own loop with a phase offset derived from its index, so the
 * wave travels rather than pulsing in unison. A single shared driver cannot
 * express that: `interpolate` needs a monotonic input range, so the phase would
 * have to be baked into per-bar ranges and would break as soon as `bars`
 * changed.
 *
 * The component is hidden from assistive technology — a waveform is decoration,
 * and the elapsed time or transcript is what should be announced.
 */
export function MobileAudioWaveform({
  levels,
  active = false,
  bars = 28,
  height = 36,
  progress,
  color = "primary",
  trackColor = "mutedBackground",
  style,
  testID,
}: MobileAudioWaveformProps) {
  const { colors } = useMobileTheme()

  const count = Math.max(1, Math.min(levels?.length ?? bars, 64))

  // A stable array of values, resized only when the bar count changes. Creating
  // them in a ref rather than a loop of hooks keeps the hook order fixed.
  const valuesRef = React.useRef<Animated.Value[] | null>(null)
  if (valuesRef.current === null || valuesRef.current.length !== count) {
    valuesRef.current = Array.from(
      { length: count },
      () => new Animated.Value(0)
    )
  }
  const values = valuesRef.current

  React.useEffect(() => {
    if (!active) {
      // Park every bar at its resting scale — a stopped waveform must not
      // freeze mid-animation.
      values.forEach((value) => value.setValue(MIN_SCALE))
      return
    }

    const loops = values.map((value, index) => {
      // Three cycle lengths, cycled by index, so neighbouring bars never sync
      // into a visible beat.
      const duration = 260 + (index % 3) * 70
      return Animated.loop(
        Animated.sequence([
          Animated.delay((index % 5) * 80),
          Animated.timing(value, {
            toValue: 1,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: MIN_SCALE,
            duration,
            useNativeDriver: true,
          }),
          Animated.delay(((count - index) % 5) * 80),
        ])
      )
    })

    loops.forEach((loop) => loop.start())
    return () => loops.forEach((loop) => loop.stop())
  }, [active, count, values])

  const activeColor = resolveColor(colors, color)
  const idleColor = resolveColor(colors, trackColor)
  const playedBars =
    progress != null ? Math.round(clamp(progress, 0, 1) * count) : -1

  return (
    <View
      testID={testID}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.row, { height }, style]}
    >
      {values.map((value, index) => {
        const staticLevel = levels?.[index]

        // Static levels and the synthetic wave share one rendering path: a
        // level is simply a scale the bar is parked at.
        const scale =
          active || staticLevel == null
            ? value.interpolate({
                inputRange: [0, 1],
                outputRange: [MIN_SCALE, 1],
                extrapolate: "clamp",
              })
            : clamp(staticLevel, MIN_SCALE, 1)

        const barColor =
          playedBars >= 0 && index >= playedBars ? idleColor : activeColor

        return (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height,
                backgroundColor: barColor,
                borderRadius: BAR_WIDTH / 2,
                transform: [{ scaleY: scale }],
              },
            ]}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: BAR_GAP,
    borderRadius: metrics.radius.sm,
  },
  bar: {
    width: BAR_WIDTH,
  },
})
