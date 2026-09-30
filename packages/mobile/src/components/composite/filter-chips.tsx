import * as React from "react"
import { ScrollView, StyleSheet, type ViewStyle } from "react-native"
import { MobileChip } from "../primitive/chip"

export interface MobileFilterChipOption {
  /**
   * Stable identifier reported through `onToggle`.
   */
  value: string
  /**
   * Chip caption.
   */
  label: string
}

export interface MobileFilterChipsProps {
  /**
   * Available filters, rendered left to right.
   */
  options: MobileFilterChipOption[]
  /**
   * Currently active filter values. Multi-select by design — a filter bar
   * that only allows one choice is a segmented control.
   */
  selected: string[]
  /**
   * Called with the tapped chip's value; the caller decides whether that
   * means add or remove.
   */
  onToggle: (value: string) => void
  /**
   * Optional style override for the scroll container.
   */
  style?: ViewStyle
}

/**
 * MobileFilterChips
 *
 * Horizontal rail of toggle chips. Scrolling beats wrapping on a phone:
 * a wrapped filter bar pushes the results it filters off-screen.
 * The indicator is hidden because the chips themselves show how much rail
 * is left.
 */
export function MobileFilterChips({
  options,
  selected,
  onToggle,
  style,
}: MobileFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={style}
      accessibilityRole="none"
    >
      {options.map((option) => (
        <MobileChip
          key={option.value}
          label={option.label}
          selected={selected.includes(option.value)}
          onPress={() => onToggle(option.value)}
        />
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
})
