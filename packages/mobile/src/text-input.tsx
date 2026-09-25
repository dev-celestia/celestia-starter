import * as React from "react"
import {
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
  StyleSheet,
  View,
  type ViewStyle,
  type TextStyle,
} from "react-native"
import { useMobileTheme } from "./host"
import { metrics } from "./tokens"

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
   * Optional error message or boolean state.
   */
  error?: boolean | string
  /**
   * Optional leading element (e.g. icon).
   */
  leading?: React.ReactNode
  /**
   * Optional trailing element (e.g. icon or clear button).
   */
  trailing?: React.ReactNode
  /**
   * Optional ref to the underlying React Native TextInput instance.
   */
  inputRef?: React.Ref<any>
}

/**
 * MobileTextInput
 *
 * Styled text input adhering to:
 * - 16px font size floor to prevent unwanted mobile viewport shifting (better-typography)
 * - 44pt minimum touch target height (better-interface)
 * - Semantic border & placeholder colors in light/dark mode (better-colors)
 */
export function MobileTextInput({
  containerStyle,
  style,
  error,
  leading,
  trailing,
  placeholderTextColor,
  onFocus,
  onBlur,
  editable = true,
  inputRef,
  ...props
}: MobileTextInputProps) {
  const { colors } = useMobileTheme()
  const [isFocused, setIsFocused] = React.useState(false)

  const handleFocus = (e: any) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e: any) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  const borderColor = error
    ? colors.destructive
    : isFocused
      ? colors.primary
      : colors.inputBorder

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
        editable={editable}
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
        {...props}
      />

      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  )
}

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
})
