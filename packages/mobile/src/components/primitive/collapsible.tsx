import * as React from "react"
import { Animated, StyleSheet, type ViewStyle } from "react-native"
import { springLayoutTo } from "../../motion"

export interface MobileCollapsibleProps {
  /**
   * Whether the content is shown. Controlled — the parent owns the state.
   */
  open: boolean
  /**
   * Content revealed when open. Stays mounted while closed so inner state
   * (form values, scroll position) survives a collapse/expand round-trip.
   */
  children: React.ReactNode
  /**
   * Optional style override for the clipping container.
   */
  style?: ViewStyle
}

/**
 * MobileCollapsible
 *
 * Animated show/hide: the clip height springs between 0 and the measured
 * content height while the content fades in and rises a few points.
 *
 * Height is a *layout* prop, so this spring cannot run on the native driver —
 * the JS thread owns it (`useNativeDriver: false`). Opacity and translateY ride
 * the same Animated.Value so all three stay perfectly in sync; splitting them
 * across drivers would desynchronise the fade from the reveal.
 *
 * Closed content stays mounted but is hidden from assistive tech via
 * `accessibilityElementsHidden` / `importantForAccessibility`.
 */
export function MobileCollapsible({
  open,
  children,
  style,
}: MobileCollapsibleProps) {
  const [contentHeight, setContentHeight] = React.useState(0)
  const progress = React.useRef(new Animated.Value(open ? 1 : 0)).current

  React.useEffect(() => {
    // springLayoutTo keeps this on the JS driver — height animates layout,
    // which the native driver cannot touch.
    springLayoutTo(progress, open ? 1 : 0).start()
  }, [open, progress])

  return (
    <Animated.View
      style={[
        styles.clip,
        {
          height: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, contentHeight],
            // Clamp so the spring's overshoot never stretches past the
            // content or dips below zero.
            extrapolate: "clamp",
          }),
          opacity: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: "clamp",
          }),
        },
        style,
      ]}
      accessibilityElementsHidden={!open}
      importantForAccessibility={open ? "auto" : "no-hide-descendants"}
    >
      <Animated.View
        onLayout={(event) => setContentHeight(event.nativeEvent.layout.height)}
        style={{
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-6, 0],
                extrapolate: "clamp",
              }),
            },
          ],
        }}
      >
        {children}
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
})
