import * as React from "react"
import {
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { typography } from "../../tokens"

export interface MobileLabelProps extends RNTextProps {
  /**
   * Label content.
   */
  children?: React.ReactNode
  /**
   * Appends a structural required marker after the label text.
   * @default false
   */
  required?: boolean
  /**
   * Dims the label and suppresses the required marker.
   * @default false
   */
  disabled?: boolean
  /**
   * Optional style override.
   */
  style?: TextStyle
}

/**
 * MobileLabel
 *
 * Form field label adhering to:
 * - the `callout` typographic role, so every field in a form shares one rhythm
 * - semantic foreground / muted / destructive colours in light and dark mode
 * - a *structural* required marker (an asterisk), never a decorative glyph
 *
 * Pair it with an input via `nativeID` + the input's `accessibilityLabelledBy`
 * for screen-reader association.
 */
export function MobileLabel({
  children,
  required = false,
  disabled = false,
  style,
  ...props
}: MobileLabelProps) {
  const { colors } = useMobileTheme()

  return (
    <RNText
      accessibilityRole="text"
      style={[
        typography.callout,
        { color: disabled ? colors.muted : colors.foreground },
        style,
      ]}
      {...props}
    >
      {children}
      {required && !disabled ? (
        <RNText style={{ color: colors.destructive }}> *</RNText>
      ) : null}
    </RNText>
  )
}
