import * as React from "react"
import { View, StyleSheet, Animated, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { canUseNativeDriver } from "../../motion"
import { MobileText } from "../primitive/text"
import { MobileProgress } from "../primitive/progress"
import { clamp } from "../../utils"

export interface MobileUploadProgressRowProps {
  /**
   * File name, truncated to one line.
   */
  name: string
  /**
   * Completion 0–1 (clamped).
   */
  progress: number
  /**
   * Terminal/active state: `uploading` pulses the leading dot, `done` shows a
   * green ✓, `error` a red !.
   * @default 'uploading'
   */
  state?: "uploading" | "done" | "error"
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileUploadProgressRow
 *
 * Name + percent + `MobileProgress` bar with a state glyph.
 *
 * The uploading glyph is a pulsing dot (opacity loop, native driver) rather
 * than a spinner: a spinner promises an unknown duration, but an upload has a
 * known one — the bar already carries that, so the dot just says "alive".
 * At 100% the bar alone cannot distinguish done from failed, which is why the
 * glyph, not the fill colour, carries the outcome (with hue as backup).
 */
export function MobileUploadProgressRow({
  name,
  progress,
  state = "uploading",
  style,
  testID,
}: MobileUploadProgressRowProps) {
  const { colors } = useMobileTheme()
  const pulseAnim = React.useRef(new Animated.Value(1)).current
  const clamped = clamp(progress, 0, 1)
  const percent = Math.round(clamped * 100)

  React.useEffect(() => {
    if (state !== "uploading") {
      // Snap back so a re-used row never starts mid-fade.
      pulseAnim.setValue(1)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: canUseNativeDriver,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: canUseNativeDriver,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [state, pulseAnim])

  const barColor = state === "error" ? "destructive" : state === "done" ? "success" : "primary"

  return (
    <View
      testID={testID}
      accessibilityLabel={`${name}, ${state}, ${percent}%`}
      style={[styles.row, style]}
    >
      <View style={styles.glyph}>
        {state === "uploading" ? (
          <Animated.View
            style={[
              styles.pulseDot,
              { backgroundColor: colors.primary, opacity: pulseAnim },
            ]}
          />
        ) : state === "done" ? (
          <MobileText variant="bodyMedium" color="success">
            ✓
          </MobileText>
        ) : (
          <MobileText variant="bodyMedium" color="destructive">
            !
          </MobileText>
        )}
      </View>

      <View style={styles.text}>
        <View style={styles.nameRow}>
          <MobileText
            variant="bodyMedium"
            numberOfLines={1}
            ellipsizeMode="middle"
            style={styles.name}
          >
            {name}
          </MobileText>
          <MobileText variant="caption" color="muted" tabular>
            {`${percent}%`}
          </MobileText>
        </View>
        <MobileProgress value={clamped} color={barColor} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  glyph: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  text: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  name: {
    flex: 1,
    flexShrink: 1,
  },
})
