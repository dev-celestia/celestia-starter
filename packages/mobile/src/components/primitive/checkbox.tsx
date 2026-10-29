import * as React from "react"
import {
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { MobileText } from "./text"
import { metrics } from "../../tokens"

export interface MobileCheckboxProps {
  /**
   * Whether the box is checked.
   */
  checked: boolean
  /**
   * Called when the user toggles the box.
   */
  onCheckedChange?: (checked: boolean) => void
  /**
   * Optional label rendered beside the box.
   */
  label?: string
  /**
   * Optional description rendered beneath the label.
   */
  description?: string
  /**
   * Error state. A string marks the control as errored and is intended to be
   * rendered by the caller (see `MobileFormField`), since a bare checkbox has no
   * place to put helper text. Only the box is recoloured — an error on a checked
   * box would be contradictory, so `checked` wins.
   */
  error?: boolean | string
  /**
   * Whether the checkbox is disabled.
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
 * MobileCheckbox
 *
 * Native checkbox built from a `Pressable` row plus a drawn tick.
 *
 * The whole row is the touch target (44pt floor), not just the 20pt box — which
 * is what makes it usable one-handed. The tick is a *structural* mark drawn with
 * two borders, so no icon dependency is introduced.
 */
export function MobileCheckbox({
  checked,
  onCheckedChange,
  label,
  description,
  error,
  disabled = false,
  style,
  testID,
}: MobileCheckboxProps) {
  const { colors } = useMobileTheme()

  const handlePress = () => {
    if (disabled) return
    Haptics.selectionAsync().catch(() => {})
    onCheckedChange?.(!checked)
  }

  const boxBorderColor =
    error && !checked
      ? colors.destructive
      : checked
        ? colors.primary
        : colors.inputBorder

  const box = (
    <View
      style={[
        styles.box,
        {
          borderColor: boxBorderColor,
          backgroundColor: checked ? colors.primary : "transparent",
        },
      ]}
    >
      {checked ? (
        <View
          style={[styles.tick, { borderColor: colors.primaryForeground }]}
        />
      ) : null}
    </View>
  )

  if (!label) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        testID={testID}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        accessibilityLabel={label}
        style={[styles.standalone, { opacity: disabled ? 0.45 : 1 }, style]}
      >
        {box}
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={[styles.row, { opacity: disabled ? 0.45 : 1 }, style]}
    >
      {box}
      <View style={styles.textContainer}>
        <MobileText variant="body">{label}</MobileText>
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
    </Pressable>
  )
}

const styles = StyleSheet.create({
  standalone: {
    minHeight: metrics.minTouchTarget,
    minWidth: metrics.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    minHeight: metrics.minTouchTarget,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    gap: 12,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: metrics.radius.sm,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  tick: {
    width: 5,
    height: 9,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "45deg" }],
    marginTop: -2,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
})
