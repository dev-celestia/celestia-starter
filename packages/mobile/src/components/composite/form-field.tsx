import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileLabel } from "../primitive/label"
import { MobileText } from "../primitive/text"

export interface MobileFormFieldProps {
  /**
   * Field label rendered above the control.
   */
  label?: string
  /**
   * Appends a required marker to the label.
   * @default false
   */
  required?: boolean
  /**
   * Helper text rendered beneath the label. Hidden while an error is shown, so
   * the two never compete for the same line.
   */
  description?: string
  /**
   * Error state. A string renders as the error message; `true` shows only the
   * control's own error border, so no copy is invented on the caller's behalf.
   */
  error?: string | boolean
  /**
   * Dims the label to match a disabled control.
   * @default false
   */
  disabled?: boolean
  /**
   * The control itself — normally a `MobileTextInput`.
   */
  children?: React.ReactNode
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileFormField
 *
 * Label + control + message. This is the one place that owns form-field
 * *rhythm* — label above, optional helper, control, then a message slot — so a
 * form built from these cannot drift out of alignment.
 *
 * It deliberately does not render its own input. The control arrives as
 * `children`, which keeps this composite usable with a text input, an OTP
 * input, a picker, or anything else.
 */
export function MobileFormField({
  label,
  required = false,
  description,
  error,
  disabled = false,
  children,
  style,
  testID,
}: MobileFormFieldProps) {
  const { colors } = useMobileTheme()

  const hasError = Boolean(error)
  const errorMessage = typeof error === "string" ? error : undefined

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label ? (
        <MobileLabel required={required} disabled={disabled}>
          {label}
        </MobileLabel>
      ) : null}

      {description && !hasError ? (
        <MobileText variant="caption" color="muted" style={styles.description}>
          {description}
        </MobileText>
      ) : null}

      <View style={styles.control}>{children}</View>

      {errorMessage ? (
        <MobileText
          variant="caption"
          style={[styles.message, { color: colors.destructive }]}
        >
          {errorMessage}
        </MobileText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  description: {
    marginTop: 2,
  },
  control: {
    marginTop: 6,
  },
  message: {
    marginTop: 6,
  },
})
