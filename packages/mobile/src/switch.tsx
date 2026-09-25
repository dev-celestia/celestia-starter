import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { Switch as ExpoUISwitch, Host } from "@expo/ui"
import * as Haptics from "expo-haptics"
import { MobileText } from "./text"
import { metrics } from "./tokens"

export interface MobileSwitchProps {
  /**
   * Whether the switch is on.
   */
  value: boolean
  /**
   * Called when the user toggles the switch.
   */
  onValueChange: (value: boolean) => void
  /**
   * Optional text label displayed alongside the switch.
   */
  label?: string
  /**
   * Optional sub-label or description.
   */
  description?: string
  /**
   * Whether the switch is disabled.
   * @default false
   */
  disabled?: boolean
  /**
   * Optional style override for the container row.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileSwitch
 *
 * Native platform toggle using `@expo/ui` (real SwiftUI on iOS and Jetpack Compose on Android)
 * with selection haptics and 44pt touch area.
 */
export function MobileSwitch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  style,
  testID,
}: MobileSwitchProps) {
  const handleChange = (val: boolean) => {
    if (disabled) return
    Haptics.selectionAsync().catch(() => {})
    onValueChange(val)
  }

  const switchElement = (
    <Host matchContents>
      <ExpoUISwitch
        value={value}
        onValueChange={handleChange}
        disabled={disabled}
        testID={testID}
      />
    </Host>
  )

  if (!label) {
    return <View style={[styles.standalone, style]}>{switchElement}</View>
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <MobileText variant="bodyMedium">{label}</MobileText>
        {description ? (
          <MobileText
            variant="caption"
            color="muted"
            style={styles.description}
          >
            {description}
          </MobileText>
        ) : null}
      </View>
      {switchElement}
    </View>
  )
}

const styles = StyleSheet.create({
  standalone: {
    minHeight: metrics.minTouchTarget,
    minWidth: metrics.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    minHeight: metrics.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  description: {
    marginTop: 2,
  },
})
