import * as React from "react"
import {
  ActivityIndicator,
  View,
  StyleSheet,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import type { ColorRamp } from "../../tokens"
import { MobileText } from "./text"

export interface MobileSpinnerProps {
  /**
   * Indicator diameter.
   * @default 'small'
   */
  size?: "small" | "large"
  /**
   * Semantic colour key from the theme, or a raw colour string.
   * @default 'primary'
   */
  color?: keyof ColorRamp | string
  /**
   * Optional caption rendered beneath the indicator.
   */
  label?: string
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

/**
 * MobileSpinner
 *
 * Activity indicator with an optional caption. Exposed to assistive technology
 * as a progressbar so a screen reader announces the wait rather than silence.
 */
export function MobileSpinner({
  size = "small",
  color = "primary",
  label,
  style,
}: MobileSpinnerProps) {
  const { colors } = useMobileTheme()
  const resolvedColor = (
    color in colors ? colors[color as keyof ColorRamp] : color
  ) as string

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator
        size={size}
        color={resolvedColor}
        accessibilityRole="progressbar"
      />
      {label ? (
        <MobileText variant="caption" color="muted" style={styles.label}>
          {label}
        </MobileText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    textAlign: "center",
  },
})
