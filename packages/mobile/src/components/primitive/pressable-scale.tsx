import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native"
import { hitSlopFor, isTextChildren } from "../../utils"
import { usePressSpring } from "../../motion"
import { MobileText } from "./text"

export interface MobilePressableScaleProps {
  /** Called on press commit. */
  onPress?: () => void
  /**
   * Scale the surface shrinks to while pressed.
   * @default 0.97
   */
  scaleTo?: number
  /**
   * Disabled pressables skip the animation entirely and render at 0.5 opacity.
   * @default false
   */
  disabled?: boolean
  children: React.ReactNode
  /**
   * Vertical `hitSlop` in points. When omitted the wrapper measures its own
   * height and pads the touch area up to the 44pt minimum automatically —
   * vertical only, because horizontal slop bleeds into siblings and React
   * Native resolves the overlap in favour of the last-drawn one.
   */
  hitSlop?: number
  /** Screen-reader label; required when the content is icon-only. */
  accessibilityLabel?: string
  /** Style for the pressable surface itself. */
  style?: ViewStyle
  /**
   * Style for the animated wrapper around the pressable surface.
   *
   * Use this for anything that positions the wrapper as a box in a layout —
   * `flex`, `margin`, `alignSelf` — because the wrapper, not the surface, is the
   * element the parent lays out. The wrapper defaults to `alignSelf:
   * "flex-start"`, so without this a wrapped surface cannot be stretched to fill
   * its parent. Same split, and same reason, as `MobileButton.containerStyle`.
   */
  containerStyle?: ViewStyle
}

/**
 * MobilePressableScale
 *
 * The reusable press wrapper: dips the surface on press-in (a 90ms timing —
 * no overshoot under a held finger) and springs it back with the house spring
 * on press-out, on `transform: scale`, so the whole animation runs on the
 * native driver.
 * Components that only need "pressable with a shrink" should compose this
 * instead of re-rolling a Pressable + Animated pair.
 */
export function MobilePressableScale({
  onPress,
  scaleTo = 0.97,
  disabled = false,
  children,
  hitSlop,
  accessibilityLabel,
  style,
  containerStyle,
}: MobilePressableScaleProps) {
  const {
    value: scale,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
  } = usePressSpring(1, scaleTo)
  const [measuredHeight, setMeasuredHeight] = React.useState<number | null>(
    null
  )

  const handleLayout = (event: LayoutChangeEvent) => {
    setMeasuredHeight(event.nativeEvent.layout.height)
  }

  const slop =
    hitSlop ?? (measuredHeight != null ? hitSlopFor(measuredHeight) : 0)

  return (
    <Animated.View
      onLayout={handleLayout}
      style={[
        styles.wrapper,
        containerStyle,
        { transform: [{ scale }], opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        hitSlop={slop > 0 ? { top: slop, bottom: slop } : undefined}
        style={style}
      >
        {isTextChildren(children) ? (
          <MobileText variant="bodyMedium">{children}</MobileText>
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-start",
  },
})
