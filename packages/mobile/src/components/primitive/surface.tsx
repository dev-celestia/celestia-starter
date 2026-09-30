import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics, type ColorRamp } from "../../tokens"

export type MobileSurfaceVariant = "background" | "surface" | "card" | "muted"

export interface MobileSurfaceProps {
  children: React.ReactNode
  /**
   * Which theme layer to paint. `card` additionally draws the 1px
   * `cardBorder` outline, matching `MobileCard`.
   * @default 'surface'
   */
  variant?: MobileSurfaceVariant
  /**
   * Corner radius in points.
   * @default metrics.radius.lg
   */
  radius?: number
  style?: ViewStyle
}

const VARIANT_COLOR: Record<MobileSurfaceVariant, keyof ColorRamp> = {
  background: "background",
  surface: "surface",
  card: "card",
  muted: "mutedBackground",
}

/**
 * MobileSurface
 *
 * Themed, non-interactive container. Its whole job is mapping a semantic
 * variant onto the colour ramp so screens never hard-code `backgroundColor`.
 * For pressable containers reach for `MobilePressableScale` around (or inside)
 * this instead of adding handlers here.
 */
export function MobileSurface({
  children,
  variant = "surface",
  radius = metrics.radius.lg,
  style,
}: MobileSurfaceProps) {
  const { colors } = useMobileTheme()

  return (
    <View
      style={[
        styles.surface,
        {
          backgroundColor: colors[VARIANT_COLOR[variant]],
          borderRadius: radius,
        },
        variant === "card"
          ? { borderWidth: 1, borderColor: colors.cardBorder }
          : null,
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  surface: {
    overflow: "hidden",
  },
})
