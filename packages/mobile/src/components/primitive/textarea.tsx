import * as React from "react"
import { Platform, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileTextInput } from "./input"
import { MobileText } from "./text"

export interface MobileTextareaProps {
  /**
   * Current text.
   */
  value: string
  /**
   * Called on every keystroke.
   */
  onChangeText: (t: string) => void
  /**
   * Placeholder shown while empty.
   */
  placeholder?: string
  /**
   * Optional label rendered above the field.
   */
  label?: string
  /**
   * Error message rendered below the field; also flips the border to the
   * destructive colour.
   */
  error?: string
  /**
   * Minimum field height in points. The field grows past it with content.
   * @default 100
   */
  minHeight?: number
  /**
   * Renders the field non-editable at half opacity.
   * @default false
   */
  disabled?: boolean
  /**
   * Optional style override for the outer container.
   */
  style?: ViewStyle
}

/**
 * MobileTextarea
 *
 * Multiline `MobileTextInput` wrapper — same chrome (border, focus-ring
 * crossfade, error colour) as the single-line field, so forms read as one
 * family. The container's row-centring is overridden to stretch because a
 * multiline input must fill the box top-to-bottom instead of riding the
 * vertical middle, and the caret needs `textAlignVertical: "top"` on Android
 * to start at the first line rather than the centre.
 */
export function MobileTextarea({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  minHeight = 100,
  disabled = false,
  style,
}: MobileTextareaProps) {
  const { colors } = useMobileTheme()

  return (
    <View style={[styles.container, disabled ? styles.disabled : null, style]}>
      {label ? (
        <MobileText variant="callout" style={styles.label}>
          {label}
        </MobileText>
      ) : null}

      <MobileTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline
        error={Boolean(error)}
        editable={!disabled}
        accessibilityLabel={label ?? placeholder}
        // Stretch, not centre: the text should start at the top of the box,
        // and the field grows with content once past minHeight.
        containerStyle={{ alignItems: "stretch", minHeight }}
        // Android centres multiline text vertically by default. The base
        // input style already provides flex and vertical padding.
        style={
          Platform.OS === "android" ? { textAlignVertical: "top" } : undefined
        }
      />

      {error ? (
        <MobileText
          variant="caption"
          style={{ color: colors.destructive, marginTop: 4 }}
        >
          {error}
        </MobileText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    marginBottom: 6,
    fontWeight: "500",
  },
})
