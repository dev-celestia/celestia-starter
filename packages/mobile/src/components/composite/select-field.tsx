import {
  Pressable,
  View,
  StyleSheet,
  Animated,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"
import { useToggle } from "../../hooks"
import { usePressSpring } from "../../motion"
import { MobileSheetPicker } from "./sheet-picker"

export interface MobileSelectFieldProps {
  /**
   * Label rendered above the trigger.
   */
  label?: string
  /**
   * Currently selected option value, or null/undefined when nothing is picked.
   */
  value?: string | null
  /**
   * Selectable options.
   */
  options: { value: string; label: string }[]
  /**
   * Called with the picked option's value.
   */
  onChange: (value: string) => void
  /**
   * Shown in the trigger while `value` is empty.
   * @default 'Select…'
   */
  placeholder?: string
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * Error message rendered under the trigger; also recolours the border.
   */
  error?: string
  /**
   * Optional style override for the outer container.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * MobileSelectField
 *
 * Button-styled trigger (border + ▾ chevron) that opens a `MobileSheetPicker`.
 *
 * A native picker wheel is not used: the sheet keeps option rows at the 44pt
 * touch floor and stays themeable in light/dark, which the platform pickers do
 * not. The trigger is a button — not a text input — because the value set is
 * closed, and a button announces itself correctly to screen readers.
 */
export function MobileSelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Select…",
  disabled = false,
  error,
  style,
  testID,
}: MobileSelectFieldProps) {
  const { colors } = useMobileTheme()
  const [open, toggleOpen, setOpen] = useToggle(false)
  // Press feedback (dip + spring back). The Pressable's `disabled` prop
  // already gates press events, so the shared hook needs no local guards.
  const {
    value: pressAnim,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
  } = usePressSpring(1, 0.985)

  const selected = options.find((option) => option.value === value) ?? null

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <MobileText variant="callout" style={styles.label}>
          {label}
        </MobileText>
      ) : null}

      <AnimatedPressable
        onPress={toggleOpen}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: selected?.label ?? placeholder }}
        accessibilityState={{ disabled, expanded: open }}
        style={[
          styles.trigger,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.destructive : colors.inputBorder,
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale: pressAnim }],
          },
        ]}
      >
        <MobileText
          variant="body"
          color={selected ? "foreground" : "muted"}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.triggerText}
        >
          {selected ? selected.label : placeholder}
        </MobileText>
        <MobileText variant="body" color="muted" style={styles.chevron}>
          ▾
        </MobileText>
      </AnimatedPressable>

      {error ? (
        <MobileText variant="caption" color="destructive" style={styles.error}>
          {error}
        </MobileText>
      ) : null}

      <MobileSheetPicker
        visible={open}
        onClose={() => setOpen(false)}
        title={label}
        options={options}
        value={value}
        onChange={onChange}
      />
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
  trigger: {
    minHeight: metrics.minTouchTarget,
    borderRadius: metrics.radius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  triggerText: {
    flex: 1,
  },
  chevron: {
    fontWeight: "600",
  },
  error: {
    marginTop: -2,
  },
})
