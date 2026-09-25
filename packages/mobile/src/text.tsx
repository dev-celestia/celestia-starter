import * as React from "react"
import {
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from "react-native"
import { typography, type ColorRamp } from "./tokens"
import { useMobileTheme } from "./host"

export type MobileTextVariant =
  | "display"
  | "heading"
  | "title"
  | "body"
  | "bodyMedium"
  | "callout"
  | "caption"
  | "label"

export interface MobileTextProps extends RNTextProps {
  /**
   * Typographic role mapped to the Celestia type scale.
   * @default 'body'
   */
  variant?: MobileTextVariant
  /**
   * Semantic color key or custom color string.
   * @default 'foreground'
   */
  color?: keyof ColorRamp | string
  /**
   * When true, enforces tabular numerals (`fontVariant: ['tabular-nums']`)
   * for consistent character widths in timers, prices, counters.
   * @default false
   */
  tabular?: boolean
  /**
   * Text alignment.
   */
  align?: "auto" | "left" | "right" | "center" | "justify"
}

/**
 * MobileText
 *
 * Strict typographic component enforcing Celestia type scale,
 * readable line-heights, contrast floors, and tabular-nums.
 */
export function MobileText({
  children,
  variant = "body",
  color = "foreground",
  tabular = false,
  align,
  style,
  ...props
}: MobileTextProps) {
  const { colors } = useMobileTheme()

  const variantStyle = typography[variant]
  const resolvedColor = (
    color in colors ? colors[color as keyof ColorRamp] : color
  ) as string

  const computedStyle: TextStyle = {
    ...variantStyle,
    color: resolvedColor,
    textAlign: align,
    fontVariant: tabular ? ["tabular-nums"] : undefined,
  }

  return (
    <RNText style={[computedStyle, style]} {...props}>
      {children}
    </RNText>
  )
}
