import * as React from "react"
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import type { ColorRamp } from "../../tokens"

export type MobileStatusDotTone =
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "muted"

const TONE_COLOR: Record<MobileStatusDotTone, keyof ColorRamp> = {
  success: "success",
  warning: "warning",
  destructive: "destructive",
  info: "info",
  muted: "muted",
}

/** One halo cycle, in ms — slow enough to read as "live", not "alarm". */
const PULSE_DURATION = 1400

export interface MobileStatusDotProps {
  /** Semantic tone, resolved through the theme ramp. */
  tone: MobileStatusDotTone
  /**
   * Dot diameter in points.
   * @default 10
   */
  size?: number
  /**
   * Loops an expanding, fading halo behind the dot — for "live"/"recording"
   * states. The loop is torn down when the prop flips off or on unmount.
   * @default false
   */
  pulse?: boolean
  /** Screen-reader description, e.g. "Online". */
  accessibilityLabel?: string
  style?: ViewStyle
}

/**
 * MobileStatusDot
 *
 * Small semantic circle for presence and health states. The pulse is a
 * procedural `Animated.loop` on opacity + scale — both native-driver-safe —
 * with cleanup in the effect return, so a scrolling list of dots never leaks
 * running animations.
 */
export function MobileStatusDot({
  tone,
  size = 10,
  pulse = false,
  accessibilityLabel,
  style,
}: MobileStatusDotProps) {
  const { colors } = useMobileTheme()
  const color = colors[TONE_COLOR[tone]]
  const pulseOpacity = React.useRef(new Animated.Value(0)).current
  const pulseScale = React.useRef(new Animated.Value(1)).current

  React.useEffect(() => {
    if (!pulse) {
      // Reset so a dot that stops pulsing never freezes mid-halo.
      pulseOpacity.setValue(0)
      pulseScale.setValue(1)
      return
    }
    pulseOpacity.setValue(0.5)
    pulseScale.setValue(1)
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: PULSE_DURATION,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 2.2,
          duration: PULSE_DURATION,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [pulse, pulseOpacity, pulseScale])

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? tone}
      style={[{ width: size, height: size }, style]}
    >
      {pulse ? (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: size / 2,
              backgroundColor: color,
              opacity: pulseOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
        />
      ) : null}
      <View
        pointerEvents="none"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        }}
      />
    </View>
  )
}
