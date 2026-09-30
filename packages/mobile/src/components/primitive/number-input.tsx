import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { clamp } from "../../utils"
import { MobileTextInput } from "./input"
import { MobileText } from "./text"

export interface MobileNumberInputProps {
  /**
   * Current text. Kept as a string (not a number) so intermediate states —
   * empty field, leading zeros — survive the round-trip; parsing is the
   * consumer's job.
   */
  value: string
  /**
   * Called with digit-filtered text on every keystroke.
   */
  onChangeText: (t: string) => void
  /**
   * Placeholder shown while empty.
   */
  placeholder?: string
  /**
   * Lower bound applied on blur. Unbounded when omitted.
   */
  min?: number
  /**
   * Upper bound applied on blur. Unbounded when omitted.
   */
  max?: number
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
 * MobileNumberInput
 *
 * `MobileTextInput` tuned for whole numbers: numeric keyboard plus a
 * digit-only filter on every keystroke, so paste cannot smuggle in letters or
 * separators. `min`/`max` are enforced on *blur*, not per keystroke — typing
 * "1" en route to "150" must not be clamped to the minimum mid-word.
 *
 * Label and error text live here rather than in the bare input, matching the
 * form-field composition the design system already uses.
 */
export function MobileNumberInput({
  value,
  onChangeText,
  placeholder,
  min,
  max,
  label,
  error,
  disabled = false,
  style,
}: MobileNumberInputProps) {
  const { colors } = useMobileTheme()

  const handleBlur = () => {
    if (value === "" || (min == null && max == null)) return
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return
    const clamped = clamp(
      parsed,
      min ?? -Infinity,
      max ?? Infinity
    )
    if (String(clamped) !== value) onChangeText(String(clamped))
  }

  return (
    <View style={[styles.container, disabled ? styles.disabled : null, style]}>
      {label ? (
        <MobileText variant="callout" style={styles.label}>
          {label}
        </MobileText>
      ) : null}

      <MobileTextInput
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/[^0-9]/g, ""))}
        onBlur={handleBlur}
        placeholder={placeholder}
        keyboardType="numeric"
        error={Boolean(error)}
        editable={!disabled}
        accessibilityLabel={label ?? placeholder}
      />

      {error ? (
        <MobileText variant="caption" style={{ color: colors.destructive, marginTop: 4 }}>
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
