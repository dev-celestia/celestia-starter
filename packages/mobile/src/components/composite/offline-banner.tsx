import * as React from "react"
import { Animated, StyleSheet, type ViewStyle } from "react-native"
import { MobileBanner } from "../primitive/banner"
import { SPRING_ENTRANCE, SPRING_EXIT, springTo } from "../../motion"

export interface MobileOfflineBannerProps {
  /**
   * Whether the banner is shown. Animated in and out with a spring so a
   * flapping connection slides rather than blinks.
   * @default true
   */
  visible?: boolean
  /**
   * Banner copy.
   * @default "No internet connection"
   */
  message?: string
  /**
   * Optional style override for the animated wrapper.
   */
  style?: ViewStyle
}

/**
 * MobileOfflineBanner
 *
 * Warning-toned connectivity banner with spring-driven show/hide.
 *
 * A render guard keeps it mounted through the exit animation and unmounts
 * it only once the spring finishes — an interrupted exit (connection came
 * straight back) cancels the unmount, mirroring the toast provider's
 * `finished` check.
 */
export function MobileOfflineBanner({
  visible = true,
  message = "No internet connection",
  style,
}: MobileOfflineBannerProps) {
  // Single 0→1 progress drives both opacity and the slide, so entrance and
  // exit share one physical feel.
  const progress = React.useRef(new Animated.Value(visible ? 1 : 0)).current
  const [rendered, setRendered] = React.useState(visible)

  React.useEffect(() => {
    if (visible) {
      setRendered(true)
      // SPRING_ENTRANCE: slight overshoot reads as "dropping in from the top".
      springTo(progress, 1, SPRING_ENTRANCE).start()
    } else {
      // SPRING_EXIT: overdamped, so the exit settles instead of bouncing back.
      springTo(progress, 0, SPRING_EXIT).start(({ finished }) => {
        if (finished) setRendered(false)
      })
    }
  }, [visible, progress])

  // Stop a half-run exit on unmount so no callback fires into a dead tree.
  React.useEffect(() => () => progress.stopAnimation(), [progress])

  if (!rendered) return null

  const slide = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 0],
    extrapolateRight: "clamp",
  })

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      pointerEvents={visible ? "auto" : "none"}
      style={[{ opacity: progress, transform: [{ translateY: slide }] }, style]}
    >
      <MobileBanner tone="warning" title={message} />
    </Animated.View>
  )
}
