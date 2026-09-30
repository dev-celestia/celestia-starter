import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { Canvas, Circle, Path, Skia } from "@shopify/react-native-skia"
import { useMobileTheme } from "../../host"
import { clamp, isTextChildren } from "../../utils"
import { MobileText } from "./text"

export interface MobileProgressRingProps {
  /**
   * Completion in the range 0–1; values outside the range are clamped. The
   * sweep re-renders on every value change rather than springing — for an
   * animated sweep, drive `value` from an `Animated` listener upstream.
   */
  value: number
  /**
   * Ring diameter in points.
   * @default 64
   */
  size?: number
  /**
   * Stroke thickness in points.
   * @default 6
   */
  strokeWidth?: number
  /**
   * Sweep colour.
   * @default colors.primary
   */
  color?: string
  /**
   * Rendered centred inside the ring (e.g. a percentage label) via an absolute
   * overlay, so it never affects the ring's layout.
   */
  children?: React.ReactNode
  style?: ViewStyle
}

/**
 * MobileProgressRing
 *
 * Circular determinate progress drawn with Skia: a full muted track circle and
 * a `Path` arc swept clockwise from 12 o'clock. Skia is an **optional** peer
 * dependency of this package (same arrangement as `MobileChartScatter`), so
 * apps that never render a ring install nothing extra.
 */
export function MobileProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  color,
  children,
  style,
}: MobileProgressRingProps) {
  const { colors } = useMobileTheme()
  const clamped = clamp(Number.isFinite(value) ? value : 0, 0, 1)
  const sweepColor = color ?? colors.primary
  const radius = (size - strokeWidth) / 2

  const arc = React.useMemo(() => {
    if (clamped <= 0) return null
    // An empty path adds a moveTo to the arc's start, so the sweep begins
    // cleanly at the top (-90°) instead of drawing a chord from the origin.
    // PathBuilder is the non-deprecated API: SkPath.addArc() warns at runtime.
    return Skia.PathBuilder.Make()
      .addArc(
        {
          x: strokeWidth / 2,
          y: strokeWidth / 2,
          width: radius * 2,
          height: radius * 2,
        },
        -90,
        clamped * 360
      )
      .detach()
  }, [clamped, strokeWidth, radius])

  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(clamped * 100),
      }}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          color={colors.mutedBackground}
          style="stroke"
          strokeWidth={strokeWidth}
        />
        {arc ? (
          <Path
            path={arc}
            color={sweepColor}
            style="stroke"
            strokeWidth={strokeWidth}
            strokeCap="round"
          />
        ) : null}
      </Canvas>
      {children ? (
        <View pointerEvents="none" style={styles.overlay}>
          {isTextChildren(children) ? (
            <MobileText variant="caption" tabular>
              {children}
            </MobileText>
          ) : (
            children
          )}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
})
