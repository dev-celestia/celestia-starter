import * as React from "react"
import {
  PanResponder,
  View,
  StyleSheet,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"

export interface MobileSliderProps {
  /**
   * Current value. Clamped to `[min, max]` and quantised to `step`.
   */
  value: number
  /**
   * Called continuously while the thumb moves.
   */
  onValueChange?: (value: number) => void
  /**
   * Called once when the gesture ends, with the final value.
   */
  onSlidingComplete?: (value: number) => void
  /**
   * @default 0
   */
  min?: number
  /**
   * @default 1
   */
  max?: number
  /**
   * Quantisation increment. Pass `0` for a continuous slider.
   * @default 0
   */
  step?: number
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * Screen-reader description. The slider also exposes adjustable actions, so
   * VoiceOver / TalkBack users can change the value with a swipe.
   */
  accessibilityLabel?: string
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const TRACK_HEIGHT = 4
const THUMB_SIZE = 24
const CONTAINER_HEIGHT = metrics.minTouchTarget

/**
 * MobileSlider
 *
 * Continuous or stepped value picker.
 *
 * Implemented on `PanResponder` rather than a native control, deliberately:
 * React Native core dropped `Slider` and the community package is a native
 * module, which would force every consumer to rebuild. This keeps the package's
 * zero-extra-dependency promise intact.
 *
 * The gesture handler is created **once** and reads the live props through refs,
 * so it never closes over a stale `value` or `onValueChange`.
 *
 * ⚠️ This is the one Phase 2 component that most needs on-device verification —
 * gesture geometry cannot be checked by a typecheck.
 */
export function MobileSlider({
  value,
  onValueChange,
  onSlidingComplete,
  min = 0,
  max = 1,
  step = 0,
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}: MobileSliderProps) {
  const { colors } = useMobileTheme()
  const [trackWidth, setTrackWidth] = React.useState(0)

  // Live values for the gesture handler, which is created only once.
  const propsRef = React.useRef({
    value,
    min,
    max,
    step,
    disabled,
    onValueChange,
    onSlidingComplete,
  })
  propsRef.current = {
    value,
    min,
    max,
    step,
    disabled,
    onValueChange,
    onSlidingComplete,
  }

  const trackWidthRef = React.useRef(0)
  trackWidthRef.current = trackWidth

  const quantise = React.useCallback((raw: number) => {
    const { min: lo, max: hi, step: increment } = propsRef.current
    const clamped = Math.min(hi, Math.max(lo, raw))
    if (increment <= 0) return clamped
    const snapped = lo + Math.round((clamped - lo) / increment) * increment
    // Re-clamp: snapping can push past the bound when the range is not a
    // whole multiple of the step.
    return Math.min(hi, Math.max(lo, Number(snapped.toFixed(6))))
  }, [])

  const setFromX = React.useCallback(
    (x: number) => {
      const width = trackWidthRef.current
      const { min: lo, max: hi } = propsRef.current
      if (width <= 0) return
      const ratio = Math.min(1, Math.max(0, x / width))
      const next = quantise(lo + ratio * (hi - lo))
      if (next !== propsRef.current.value) {
        propsRef.current.onValueChange?.(next)
      }
    },
    [quantise]
  )

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !propsRef.current.disabled,
      onMoveShouldSetPanResponder: () => !propsRef.current.disabled,
      onPanResponderGrant: (event: GestureResponderEvent) => {
        setFromX(event.nativeEvent.locationX)
      },
      onPanResponderMove: (event: GestureResponderEvent) => {
        setFromX(event.nativeEvent.locationX)
      },
      onPanResponderRelease: () => {
        if (propsRef.current.disabled) return
        Haptics.selectionAsync().catch(() => {})
        propsRef.current.onSlidingComplete?.(propsRef.current.value)
      },
      onPanResponderTerminate: () => {
        propsRef.current.onSlidingComplete?.(propsRef.current.value)
      },
    })
  ).current

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width)
  }

  const range = max - min
  const ratio = range === 0 ? 0 : Math.min(1, Math.max(0, (value - min) / range))
  const fillWidth = trackWidth * ratio
  const thumbLeft = Math.min(
    Math.max(0, fillWidth - THUMB_SIZE / 2),
    Math.max(0, trackWidth - THUMB_SIZE)
  )

  const handleAccessibilityAction = (event: {
    nativeEvent: { actionName: string }
  }) => {
    if (disabled) return
    const increment = step > 0 ? step : range / 10
    const { actionName } = event.nativeEvent
    if (actionName === "increment") {
      onValueChange?.(quantise(value + increment))
    } else if (actionName === "decrement") {
      onValueChange?.(quantise(value - increment))
    }
  }

  return (
    <View
      {...panResponder.panHandlers}
      testID={testID}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
      onAccessibilityAction={handleAccessibilityAction}
      onLayout={handleLayout}
      style={[styles.container, { opacity: disabled ? 0.45 : 1 }, style]}
    >
      <View
        style={[styles.track, { backgroundColor: colors.mutedBackground }]}
      >
        <View
          style={[
            styles.fill,
            { width: fillWidth, backgroundColor: colors.primary },
          ]}
        />
      </View>

      <View
        style={[
          styles.thumb,
          {
            left: thumbLeft,
            backgroundColor: colors.card,
            borderColor: colors.primary,
          },
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: CONTAINER_HEIGHT,
    justifyContent: "center",
    width: "100%",
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
  },
})
