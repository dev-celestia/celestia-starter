import * as React from "react"
import { Pressable, ScrollView, View, StyleSheet } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { MobileBottomSheet } from "../primitive/bottom-sheet"
import { metrics } from "../../tokens"
import { hapticSelect } from "../../utils"

export interface MobileSheetPickerProps {
  /**
   * Whether the sheet is presented.
   */
  visible: boolean
  /**
   * Called when the sheet is dismissed (backdrop, drag, or after a pick).
   */
  onClose: () => void
  /**
   * Heading rendered at the top of the sheet.
   */
  title?: string
  /**
   * Selectable options.
   */
  options: { value: string; label: string }[]
  /**
   * Currently selected option value; its row gets the checkmark.
   */
  value?: string | null
  /**
   * Called with the picked option's value, immediately before the sheet closes.
   */
  onChange: (value: string) => void
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileSheetPicker
 *
 * Option list inside `MobileBottomSheet`: full-width rows at the 44pt touch
 * floor with a ✓ on the selected one.
 *
 * A sheet (rather than an alert or inline menu) because option lists can be
 * long, and thumb reach on a phone is bottom-heavy. Picking commits with a
 * selection haptic and closes in the same gesture — one decision, one sheet.
 */
export function MobileSheetPicker({
  visible,
  onClose,
  title,
  options,
  value,
  onChange,
  testID,
}: MobileSheetPickerProps) {
  const { colors } = useMobileTheme()

  const handlePick = (optionValue: string) => {
    hapticSelect()
    onChange(optionValue)
    onClose()
  }

  return (
    <MobileBottomSheet isPresented={visible} onDismiss={onClose} testID={testID}>
      {title ? (
        <MobileText variant="title" style={styles.title}>
          {title}
        </MobileText>
      ) : null}
      <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
        {options.map((option) => {
          const selected = option.value === value
          return (
            <Pressable
              key={option.value}
              onPress={() => handlePick(option.value)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.row,
                {
                  borderRadius: metrics.radius.md,
                  backgroundColor: pressed ? colors.mutedBackground : "transparent",
                },
              ]}
            >
              <MobileText
                variant="body"
                color={selected ? "primary" : "foreground"}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.rowLabel}
              >
                {option.label}
              </MobileText>
              {selected ? (
                <MobileText variant="bodyMedium" color="primary">
                  ✓
                </MobileText>
              ) : (
                // Reserve the checkmark's width so labels do not shift when a
                // row becomes selected.
                <View style={styles.checkSpacer} />
              )}
            </Pressable>
          )
        })}
      </ScrollView>
    </MobileBottomSheet>
  )
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    minHeight: metrics.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
  },
  checkSpacer: {
    width: 18,
  },
})
