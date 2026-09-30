import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { MobileText } from "../primitive/text"
import { MobileTextInput } from "../primitive/input"
import { MobileChip } from "../primitive/chip"

export interface MobilePhoneInputProps {
  /**
   * National number (digits only — anything else is filtered out).
   */
  value: string
  /**
   * Called with the digit-filtered text on every edit.
   */
  onChangeText: (text: string) => void
  /**
   * Static dialling code shown in the leading chip, e.g. `"+1"`. Non-digit
   * characters are stripped and a `+` is prepended.
   * @default '+1'
   */
  defaultCountryCode?: string
  /**
   * Label rendered above the field.
   */
  label?: string
  /**
   * Error message rendered under the field; also flags the input as errored.
   */
  error?: string
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * Optional style override for the outer container.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobilePhoneInput
 *
 * Dialling-code chip + numeric input.
 *
 * The code chip is deliberately **static and prop-driven**: a country-picker
 * with flag emoji and dialling tables is a data problem, and this package
 * takes no data dependencies. Consumers that need selection can swap the chip
 * upstream. Digits are filtered on the way out (`onChangeText` never emits
 * non-digits), so paste of "+1 (555) 010-1234" lands as "15550101234" and the
 * consumer's validation stays trivial.
 */
export function MobilePhoneInput({
  value,
  onChangeText,
  defaultCountryCode = "+1",
  label,
  error,
  disabled = false,
  style,
  testID,
}: MobilePhoneInputProps) {
  const digits = defaultCountryCode.replace(/\D/g, "")
  const code = `+${digits || "1"}`

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <MobileText variant="callout" style={styles.label}>
          {label}
        </MobileText>
      ) : null}

      <MobileTextInput
        testID={testID}
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/\D/g, ""))}
        leading={<MobileChip label={code} />}
        placeholder="Phone number"
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        autoCorrect={false}
        editable={!disabled}
        error={error}
        accessibilityLabel={label ?? "Phone number"}
      />

      {error ? (
        <MobileText variant="caption" color="destructive">
          {error}
        </MobileText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontWeight: "500",
  },
})
