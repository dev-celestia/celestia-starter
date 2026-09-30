import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"

export interface MobileToolbarProps {
  /** Action controls — icon buttons, short buttons — laid out in a row. */
  children: React.ReactNode
  style?: ViewStyle
}

/**
 * MobileToolbar
 *
 * Bottom action strip: a `surface`-coloured row at least 44pt tall with a
 * hairline top border, so it reads as a control shelf attached to the screen
 * edge rather than floating content. Safe-area bottom inset is the caller's
 * job (pair with `useSafeAreaInsets`).
 */
export function MobileToolbar({ children, style }: MobileToolbarProps) {
  const { colors } = useMobileTheme()

  return (
    <View
      accessibilityRole="toolbar"
      style={[
        styles.toolbar,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: metrics.minTouchTarget,
    paddingHorizontal: 12,
    gap: 12,
  },
})
