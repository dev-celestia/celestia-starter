import * as React from "react"
import { Animated, Platform, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"

export interface MobileSkeletonProps {
  /**
   * Placeholder width. Percentages are relative to the parent.
   * @default '100%'
   */
  width?: number | `${number}%`
  /**
   * Placeholder height.
   * @default 16
   */
  height?: number
  /**
   * Corner radius. Pass `metrics.radius.full` for a pill.
   * @default metrics.radius.sm
   */
  radius?: number
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

/**
 * MobileSkeleton
 *
 * Loading placeholder that pulses between 40% and 100% opacity on a loop.
 *
 * It is hidden from assistive technology on purpose: a screen reader should hear
 * the *loading state* (announced by the surrounding screen or a `MobileSpinner`),
 * not a list of meaningless empty boxes.
 */
export function MobileSkeleton({
  width = "100%",
  height = 16,
  radius = metrics.radius.sm,
  style,
}: MobileSkeletonProps) {
  const { colors } = useMobileTheme()
  const pulse = React.useRef(new Animated.Value(0.4)).current

  React.useEffect(() => {
    const useNativeDriver = Platform.OS !== "web"
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [pulse])

  return (
    <Animated.View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.mutedBackground,
          opacity: pulse,
        },
        style,
      ]}
    />
  )
}
