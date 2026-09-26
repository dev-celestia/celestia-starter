import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "./text"

export interface MobileSeparatorProps {
  /**
   * Divider direction. A vertical separator stretches to its parent's height.
   * @default 'horizontal'
   */
  orientation?: "horizontal" | "vertical"
  /**
   * Optional centred caption. Only rendered for horizontal separators.
   */
  label?: string
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

/**
 * MobileSeparator
 *
 * Semantic divider that reads its colour from the theme, so it stays visible in
 * both light and dark mode without any caller-side tuning. Purely decorative —
 * it is hidden from assistive technology.
 */
export function MobileSeparator({
  orientation = "horizontal",
  label,
  style,
}: MobileSeparatorProps) {
  const { colors } = useMobileTheme()

  if (orientation === "vertical") {
    return (
      <View
        accessible={false}
        importantForAccessibility="no"
        style={[styles.vertical, { backgroundColor: colors.border }, style]}
      />
    )
  }

  if (!label) {
    return (
      <View
        accessible={false}
        importantForAccessibility="no"
        style={[styles.horizontal, { backgroundColor: colors.border }, style]}
      />
    )
  }

  return (
    <View style={[styles.labelRow, style]}>
      <View
        accessible={false}
        importantForAccessibility="no"
        style={[styles.labelLine, { backgroundColor: colors.border }]}
      />
      <MobileText variant="caption" color="muted" style={styles.label}>
        {label}
      </MobileText>
      <View
        accessible={false}
        importantForAccessibility="no"
        style={[styles.labelLine, { backgroundColor: colors.border }]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: "100%",
  },
  vertical: {
    width: 1,
    alignSelf: "stretch",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  labelLine: {
    flex: 1,
    height: 1,
  },
  label: {
    letterSpacing: 0.3,
  },
})
