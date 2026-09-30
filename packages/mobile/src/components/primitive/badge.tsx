import * as React from "react"
import {
  Animated,
  StyleSheet,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "./text"
import { metrics } from "../../tokens"
import { isTextChildren } from "../../utils"
import { springTo, SPRING_SNAPPY } from "../../motion"

export type MobileBadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "info"
  | "destructive"
  | "outline"

export interface MobileBadgeProps {
  /**
   * Badge content (string or ReactNode).
   */
  children?: React.ReactNode
  /**
   * Status variant.
   * @default 'default'
   */
  variant?: MobileBadgeVariant
  /**
   * Enable tabular numbers for numeric counts.
   * @default false
   */
  tabular?: boolean
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

/**
 * MobileBadge
 *
 * Compact status pill adhering to:
 * - WCAG AA contrast semantic color ramps (better-colors)
 * - Tabular numbers on counts to prevent jitter (better-typography)
 */
export function MobileBadge({
  children,
  variant = "default",
  tabular = false,
  style,
}: MobileBadgeProps) {
  const { colors } = useMobileTheme()

  // Pops (1 → 1.15 → 1) whenever the *displayed* content changes — a count
  // ticking up should be felt, not just read. Arbitrary ReactNode children
  // re-create every render and are excluded, so only string/number labels pop.
  const pop = React.useRef(new Animated.Value(1)).current
  const displayValue =
    typeof children === "string" || typeof children === "number"
      ? children
      : undefined
  const prevValue = React.useRef(displayValue)

  React.useEffect(() => {
    if (prevValue.current === displayValue) return
    prevValue.current = displayValue
    const anim = Animated.sequence([
      springTo(pop, 1.15, SPRING_SNAPPY),
      springTo(pop, 1, SPRING_SNAPPY),
    ])
    anim.start()
    return () => anim.stop()
  }, [displayValue, pop])

  const getVariantStyles = (): { bg: string; text: string; border: string } => {
    switch (variant) {
      case "secondary":
        return {
          bg: colors.secondary,
          text: colors.secondaryForeground,
          border: colors.secondary,
        }
      case "success":
        return {
          bg: colors.success,
          text: colors.successForeground,
          border: colors.success,
        }
      case "warning":
        return {
          bg: colors.warning,
          text: colors.warningForeground,
          border: colors.warning,
        }
      case "info":
        return {
          bg: colors.info,
          text: colors.infoForeground,
          border: colors.info,
        }
      case "destructive":
        return {
          bg: colors.destructive,
          text: colors.destructiveForeground,
          border: colors.destructive,
        }
      case "outline":
        return {
          bg: "transparent",
          text: colors.foreground,
          border: colors.border,
        }
      case "default":
      default:
        return {
          bg: colors.primary,
          text: colors.primaryForeground,
          border: colors.primary,
        }
    }
  }

  const { bg, text, border } = getVariantStyles()

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
        },
        style,
        // Last so the pop is never overridden by a caller's `style`.
        { transform: [{ scale: pop }] },
      ]}
    >
      {isTextChildren(children) ? (
        <MobileText
          variant="label"
          tabular={tabular}
          style={{ color: text, fontWeight: "600" }}
        >
          {children}
        </MobileText>
      ) : (
        children
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: metrics.radius.full,
    borderWidth: 1,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
})
