import * as React from "react"
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
  type TextStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileText } from "./text"

export interface MobileTextInputProps extends Omit<RNTextInputProps, "style"> {
  /**
   * Container style override.
   */
  containerStyle?: ViewStyle
  /**
   * Input text style override.
   */
  style?: TextStyle
  /**
   * Error state. A string marks the field as errored and is intended to be
   * rendered by the caller (see `MobileFormField`), since a bare input has no
   * place to put helper text.
   */
  error?: boolean | string
  /**
   * Optional leading element (e.g. icon).
   */
  leading?: React.ReactNode
  /**
   * Optional trailing element (e.g. icon).
   */
  trailing?: React.ReactNode
  /**
   * Renders a clear affordance once the field has a value. The glyph is a
   * structural mark, so no icon dependency is introduced. Suppressed on secure
   * fields, where the reveal toggle owns the trailing slot.
   * @default false
   */
  clearable?: boolean
  /**
   * Called when the clear affordance is pressed, after `onChangeText("")`.
   */
  onClear?: () => void
  /**
   * Masks the value **and** renders a reveal toggle in the trailing slot.
   *
   * Use this for passwords. It exists on the primitive rather than in each
   * screen because every password field needs the same toggle, and three
   * hand-rolled copies would drift on the accessible name, the touch target and
   * the label copy. Pass `secureTextEntry` directly instead if you want masking
   * with no toggle.
   * @default false
   */
  secure?: boolean
  /**
   * Caption on the reveal toggle while the value is masked.
   * @default 'Show'
   */
  revealLabel?: string
  /**
   * Caption on the reveal toggle while the value is visible.
   * @default 'Hide'
   */
  hideLabel?: string
  /**
   * Optional ref to the underlying React Native TextInput instance.
   */
  inputRef?: React.Ref<React.ComponentRef<typeof RNTextInput>>
}

/**
 * MobileTextInput
 *
 * Styled text input adhering to:
 * - 16px font size floor to prevent unwanted mobile viewport shifting (better-typography)
 * - 44pt minimum touch target height (better-interface)
 * - Semantic border & placeholder colors in light/dark mode (better-colors)
 *
 * This is the *bare* input — border, focus ring and slots. Label, helper and
 * error text are a specific job, so they live in the `MobileFormField`
 * composite rather than being duplicated here.
 */
export function MobileTextInput({
  containerStyle,
  style,
  error,
  leading,
  trailing,
  clearable = false,
  onClear,
  secure = false,
  revealLabel = "Show",
  hideLabel = "Hide",
  value,
  onChangeText,
  placeholderTextColor,
  onFocus,
  onBlur,
  editable = true,
  inputRef,
  secureTextEntry,
  ...props
}: MobileTextInputProps) {
  const { colors } = useMobileTheme()
  const [isFocused, setIsFocused] = React.useState(false)
  const [revealed, setRevealed] = React.useState(false)

  const handleFocus: NonNullable<RNTextInputProps["onFocus"]> = (event) => {
    setIsFocused(true)
    onFocus?.(event)
  }

  const handleBlur: NonNullable<RNTextInputProps["onBlur"]> = (event) => {
    setIsFocused(false)
    onBlur?.(event)
  }

  const handleClear = () => {
    onChangeText?.("")
    onClear?.()
  }

  const borderColor = error
    ? colors.destructive
    : isFocused
      ? colors.primary
      : colors.inputBorder

  const showClear =
    clearable &&
    !secure &&
    editable &&
    typeof value === "string" &&
    value.length > 0

  const showReveal = secure && editable

  return (
    <View
      style={[
        styles.container,
        {
          borderColor,
          backgroundColor: colors.surface,
          borderRadius: metrics.radius.md,
          opacity: editable ? 1 : 0.5,
        },
        containerStyle,
      ]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}

      <RNTextInput
        ref={inputRef}
        {...props}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        // Explicit props come after the spread so a caller cannot accidentally
        // pass `secureTextEntry` and leave the reveal toggle out of sync.
        secureTextEntry={secure ? !revealed : secureTextEntry}
        placeholderTextColor={placeholderTextColor ?? colors.muted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          styles.input,
          {
            color: colors.foreground,
            // Minimum 16px to prevent automated iOS Safari/WebKit zoom
            fontSize: 16,
            lineHeight: 22,
          },
          style,
        ]}
      />

      {showClear ? (
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear input"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.clear}
        >
          <MobileText variant="caption" color="muted" style={styles.clearGlyph}>
            ✕
          </MobileText>
        </Pressable>
      ) : null}

      {showReveal ? (
        <Pressable
          onPress={() => setRevealed((current) => !current)}
          accessibilityRole="button"
          // The visible caption ("Show" / "Hide") is ambiguous read aloud on its
          // own, so the accessible name spells out what is being revealed.
          accessibilityLabel={revealed ? "Hide password" : "Show password"}
          accessibilityState={{ expanded: revealed }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.reveal}
        >
          <MobileText variant="callout" style={{ color: colors.primary }}>
            {revealed ? hideLabel : revealLabel}
          </MobileText>
        </Pressable>
      ) : null}

      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  )
}

/**
 * `MobileInput` is the same component under the name most callers reach for.
 * Prefer it in new code; `MobileTextInput` is kept as the original export.
 */
export const MobileInput = MobileTextInput

export type MobileInputProps = MobileTextInputProps

const styles = StyleSheet.create({
  container: {
    minHeight: metrics.minTouchTarget,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  leading: {
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  trailing: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  clear: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  clearGlyph: {
    fontWeight: "600",
  },
  reveal: {
    marginLeft: 8,
    minHeight: metrics.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
})
