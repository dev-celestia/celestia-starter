import * as React from "react"
import { StyleSheet, type ViewStyle } from "react-native"
import { MobileSegmentedControl } from "./segmented-control"

export type MobileThemeValue = "light" | "dark" | "system"

export interface MobileThemeSelectorProps {
  /**
   * Active theme choice.
   */
  value: MobileThemeValue
  /**
   * Called with the newly picked value.
   */
  onChange: (value: MobileThemeValue) => void
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

/**
 * Glyph + word per option. The word is not decoration: a lone "☾" gives a
 * screen reader nothing sensible to announce and leaves the choice ambiguous
 * for sighted users on first run.
 */
const OPTIONS: { value: MobileThemeValue; label: string }[] = [
  { value: "light", label: "☀ Light" },
  { value: "dark", label: "☾ Dark" },
  { value: "system", label: "⚙ System" },
]

/**
 * MobileThemeSelector
 *
 * Three-way light/dark/system picker. Delegates to `MobileSegmentedControl`
 * — its value-keyed selection and sliding indicator are exactly this UX, so
 * rebuilding it here would only risk drift.
 */
export function MobileThemeSelector({
  value,
  onChange,
  style,
}: MobileThemeSelectorProps) {
  return (
    <MobileSegmentedControl
      options={OPTIONS}
      value={value}
      onValueChange={(next) => onChange(next as MobileThemeValue)}
      style={StyleSheet.flatten([styles.control, style])}
    />
  )
}

const styles = StyleSheet.create({
  control: {
    width: "100%",
  },
})
