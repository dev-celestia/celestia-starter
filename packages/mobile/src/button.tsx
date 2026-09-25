import * as React from "react"
import {
  Pressable,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
  Animated,
  Platform,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "./host"
import { MobileText } from "./text"
import { metrics } from "./tokens"

export type MobileButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
export type MobileButtonSize = "sm" | "default" | "lg"

export interface MobileButtonProps {
  /**
   * Button text label or React children.
   */
  children?: React.ReactNode
  /**
   * Visual variant matching Celestia UI design system.
   * @default 'default'
   */
  variant?: MobileButtonVariant
  /**
   * Button size affecting height and padding.
   * @default 'default'
   */
  size?: MobileButtonSize
  /**
   * Called when the button is pressed.
   */
  onPress?: () => void
  /**
   * Whether the button is disabled.
   * @default false
   */
  disabled?: boolean
  /**
   * Optional custom style override.
   */
  style?: ViewStyle
  /**
   * Optional test ID for automation.
   */
  testID?: string
}

/**
 * MobileButton
 *
 * Native mobile button adhering to:
 * - 44x44pt minimum touch target (better-interface)
 * - 0.97 press scale animation for physical depth (expo-animation)
 * - Same-frame haptic feedback (Light / Medium for destructive)
 * - Celestia WCAG AA contrast semantic variants (better-colors)
 */
export function MobileButton({
  children,
  variant = "default",
  size = "default",
  onPress,
  disabled = false,
  style,
  testID,
}: MobileButtonProps) {
  const { colors } = useMobileTheme()
  const scaleAnim = React.useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    if (disabled) return
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 120,
      useNativeDriver: Platform.OS !== "web",
    }).start()
  }

  const handlePressOut = () => {
    if (disabled) return
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 15,
      mass: 1,
      stiffness: 250,
      useNativeDriver: Platform.OS !== "web",
    }).start()
  }

  const handlePress = () => {
    if (disabled || !onPress) return
    // Haptics fired on the causal commit frame (expo-animation)
    if (variant === "destructive") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    }
    onPress()
  }

  // Sizing definitions
  const sizeStyles: Record<
    MobileButtonSize,
    { minHeight: number; paddingHorizontal: number; radius: number }
  > = {
    sm: {
      minHeight: metrics.minTouchTarget,
      paddingHorizontal: 12,
      radius: metrics.radius.sm,
    },
    default: {
      minHeight: metrics.minTouchTarget,
      paddingHorizontal: 16,
      radius: metrics.radius.md,
    },
    lg: { minHeight: 48, paddingHorizontal: 20, radius: metrics.radius.lg },
  }

  const currentSize = sizeStyles[size]

  // Variant color definitions (better-colors)
  const getVariantStyles = (): { container: ViewStyle; textColor: string } => {
    switch (variant) {
      case "destructive":
        return {
          container: {
            backgroundColor: colors.destructive,
            borderColor: colors.destructive,
          },
          textColor: colors.destructiveForeground,
        }
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderColor: colors.border,
            borderWidth: 1,
          },
          textColor: colors.foreground,
        }
      case "secondary":
        return {
          container: {
            backgroundColor: colors.secondary,
            borderColor: colors.secondary,
          },
          textColor: colors.secondaryForeground,
        }
      case "ghost":
        return {
          container: {
            backgroundColor: "transparent",
            borderColor: "transparent",
          },
          textColor: colors.foreground,
        }
      case "default":
      default:
        return {
          container: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
          },
          textColor: colors.primaryForeground,
        }
    }
  }

  const { container: variantContainer, textColor } = getVariantStyles()

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        style={[
          styles.base,
          {
            minHeight: currentSize.minHeight,
            paddingHorizontal: currentSize.paddingHorizontal,
            borderRadius: currentSize.radius,
            opacity: disabled ? 0.45 : 1,
          },
          variantContainer,
          style,
        ]}
      >
        {typeof children === "string" ? (
          <MobileText
            variant={size === "sm" ? "callout" : "bodyMedium"}
            style={{ color: textColor, fontWeight: "600" }}
          >
            {children}
          </MobileText>
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
})
