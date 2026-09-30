import * as React from "react"
import { StyleSheet, View } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "./text"

export interface MobileDividerTextProps {
  /**
   * Caption set between the two hairlines, e.g. "or continue with".
   */
  label: string
}

/**
 * MobileDividerText
 *
 * Hairline — label — hairline row for soft section breaks in forms ("or
 * continue with"). Purely decorative structure: the hairlines are
 * `StyleSheet.hairlineWidth` so they render as true 1px lines on every
 * density, and only the label is exposed to screen readers — announcing the
 * rules would be noise.
 */
export function MobileDividerText({ label }: MobileDividerTextProps) {
  const { colors } = useMobileTheme()

  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel={label}>
      <View style={[styles.rule, { backgroundColor: colors.border }]} />
      <MobileText variant="caption" color="muted" style={styles.label}>
        {label}
      </MobileText>
      <View style={[styles.rule, { backgroundColor: colors.border }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  label: {
    marginHorizontal: 12,
  },
})
