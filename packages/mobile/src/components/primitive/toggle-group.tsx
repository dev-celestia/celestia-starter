import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { MobileChip } from "./chip"

export interface MobileToggleGroupOption {
  /** Stable value reported through `onChange`. */
  value: string
  /** Visible pill caption. */
  label: string
}

export interface MobileToggleGroupProps {
  /**
   * Available options, rendered left to right.
   */
  options: MobileToggleGroupOption[]
  /**
   * Current selection: a single `string` in single mode, a `string[]` in
   * multiple mode.
   */
  value: string | string[]
  /**
   * Selection callback. Single mode emits the chosen `string`; multiple mode
   * emits the new `string[]` (tapping a selected pill removes it).
   */
  onChange: (v: string | string[]) => void
  /**
   * Allow several options selected at once.
   * @default false
   */
  multiple?: boolean
  /**
   * Optional style override for the row container.
   */
  style?: ViewStyle
}

/**
 * MobileToggleGroup
 *
 * Pill row of mutually-aware toggles built on `MobileChip`, so the selected
 * fill crossfade, press spring and 44pt hit slop come for free.
 *
 * Single mode behaves like a radio group (selecting replaces the value);
 * multiple mode behaves like checkboxes (selecting toggles membership and
 * emits an array). `accessibilityState.checked` is forwarded to each chip so
 * screen readers hear the selection, which the chip cannot know on its own.
 */
export function MobileToggleGroup({
  options,
  value,
  onChange,
  multiple = false,
  style,
}: MobileToggleGroupProps) {
  const selectedList = React.useMemo(
    () => (multiple ? (Array.isArray(value) ? value : [value]) : null),
    [multiple, value]
  )

  const isSelected = (optionValue: string): boolean =>
    multiple ? (selectedList ?? []).includes(optionValue) : value === optionValue

  const handlePress = (optionValue: string) => {
    if (multiple) {
      const current = Array.isArray(value) ? value : value ? [value] : []
      const next = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue]
      onChange(next)
      return
    }
    onChange(optionValue)
  }

  return (
    <View
      style={[styles.row, style]}
      accessibilityRole={multiple ? undefined : "radiogroup"}
    >
      {options.map((option) => {
        const selected = isSelected(option.value)
        return (
          <MobileChip
            key={option.value}
            label={option.label}
            selected={selected}
            onPress={() => handlePress(option.value)}
            accessibilityState={{ checked: selected }}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
})
