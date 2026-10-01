import * as React from "react"
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticMedium, hitSlopFor } from "../../utils"
import { MobileText } from "../primitive/text"

export interface MobileStopButtonProps {
  /**
   * Fired on commit — abort the in-flight generation.
   */
  onPress: () => void
  /**
   * Button caption.
   * @default 'Stop'
   */
  label?: string
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const BUTTON_HEIGHT = 32

/**
 * MobileStopButton
 *
 * The "stop generating" control.
 *
 * It fires the **medium** haptic, not the light one: stopping is a destructive
 * commit — it discards work in progress — and the same rule that makes a
 * destructive button heavier applies here. The square glyph is drawn inline,
 * matching the convention that only structural marks ship with the package.
 */
export function MobileStopButton({
  onPress,
  label = "Stop",
  style,
  testID,
}: MobileStopButtonProps) {
  const { colors } = useMobileTheme()
  const slop = hitSlopFor(BUTTON_HEIGHT)

  return (
    <Pressable
      onPress={() => {
        hapticMedium()
        onPress()
      }}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: slop, bottom: slop }}
      style={[
        styles.button,
        {
          minHeight: BUTTON_HEIGHT,
          borderRadius: metrics.radius.full,
          backgroundColor: colors.mutedBackground,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.square,
          { backgroundColor: colors.foreground, borderRadius: 2 },
        ]}
      />
      <MobileText variant="callout" style={{ fontWeight: "600" }}>
        {label}
      </MobileText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  square: {
    width: 10,
    height: 10,
  },
})
