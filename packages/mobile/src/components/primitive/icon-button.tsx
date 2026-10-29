import * as React from "react"
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"

export type MobileIconButtonVariant =
  | "default"
  | "ghost"
  | "outline"
  | "destructive"
export type MobileIconButtonSize = "sm" | "md" | "lg"

const SIZE_MAP: Record<MobileIconButtonSize, number> = {
  sm: metrics.minTouchTarget,
  md: metrics.minTouchTarget,
  lg: 52,
}

export interface MobileIconButtonProps {
  /**
   * Icon node. Icons arrive as props — this package ships no icon dependency.
   */
  icon: React.ReactNode
  /**
   * Required screen-reader description. An icon-only control with no label is
   * unusable with a screen reader, so this is not optional.
   */
  accessibilityLabel: string
  /**
   * Called when the button is pressed.
   */
  onPress?: () => void
  /**
   * Visual variant.
   * @default 'ghost'
   */
  variant?: MobileIconButtonVariant
  /**
   * Button size. `sm` and `md` both floor at the 44pt touch target; only the
   * visual box grows for `lg`.
   * @default 'md'
   */
  size?: MobileIconButtonSize
  /**
   * Whether the button is disabled.
   * @default false
   */
  disabled?: boolean
  /**
   * Optional style override for the pressable surface.
   */
  style?: ViewStyle
  /**
   * Style for the animated wrapper around the pressable surface — use it for
   * `flex`, `margin` or `alignSelf`, since the wrapper is the element the parent
   * lays out.
   */
  containerStyle?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileIconButton
 *
 * Square icon-only control adhering to:
 * - a 44×44pt minimum touch target regardless of the visual size
 * - the same 0.97 press-scale + same-frame haptics as `MobileButton`
 * - a *required* `accessibilityLabel`, since the icon carries no text
 */
export function MobileIconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = "ghost",
  size = "md",
  disabled = false,
  style,
  containerStyle,
  testID,
}: MobileIconButtonProps) {
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
    if (variant === "destructive") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    }
    onPress()
  }

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case "destructive":
        return { backgroundColor: colors.destructive }
      case "outline":
        return { backgroundColor: "transparent", borderColor: colors.border }
      case "default":
        return { backgroundColor: colors.primary }
      case "ghost":
      default:
        return { backgroundColor: "transparent", borderColor: "transparent" }
    }
  }

  const dimension = SIZE_MAP[size]

  return (
    <Animated.View
      style={[{ transform: [{ scale: scaleAnim }] }, containerStyle]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        style={[
          styles.base,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            opacity: disabled ? 0.45 : 1,
          },
          getVariantStyles(),
          style,
        ]}
      >
        {icon}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
})
