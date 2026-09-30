import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native"
import { useMobileTheme } from "../../host"
import { SPRING_ENTRANCE, springTo } from "../../motion"
import { metrics } from "../../tokens"
import { MobileText } from "./text"

/** How long the bubble stays up before auto-hiding. */
const AUTO_HIDE_MS = 1500

export interface MobileTooltipProps {
  /**
   * Bubble caption. Keep it to one short line — the bubble sizes to content
   * and is not meant to hold paragraphs.
   */
  label: string
  /**
   * Element the tooltip anchors to. It is wrapped in a long-press target.
   */
  children: React.ReactNode
}

/**
 * MobileTooltip
 *
 * Long-press reveals a small dark bubble above the child; it auto-hides after
 * ~1.5s or immediately on press-out. The dark bubble inverts the theme
 * (`foreground` fill, `background` ink) so it reads as floating chrome in both
 * schemes without a separate token.
 *
 * The bubble is anchored with a measured offset — the wrapper reports its
 * height via `onLayout` and the bubble sits that far above the container's
 * bottom edge — and never intercepts touches (`pointerEvents="none"`).
 * Entrance is opacity + translateY on the native driver.
 */
export function MobileTooltip({ label, children }: MobileTooltipProps) {
  const { colors } = useMobileTheme()
  const [visible, setVisible] = React.useState(false)
  const [anchorHeight, setAnchorHeight] = React.useState(0)
  const fade = React.useRef(new Animated.Value(0)).current
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (hideTimer.current != null) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }

  const hide = React.useCallback(() => {
    clearTimer()
    setVisible(false)
  }, [])

  const show = () => {
    clearTimer()
    setVisible(true)
    // Auto-hide: a tooltip is a glance, not a popover.
    hideTimer.current = setTimeout(() => setVisible(false), AUTO_HIDE_MS)
  }

  React.useEffect(() => {
    if (!visible) {
      // Reset so the next reveal springs from the start pose.
      fade.setValue(0)
      return
    }
    springTo(fade, 1, SPRING_ENTRANCE).start()
  }, [visible, fade])

  // Never leave a timer running past unmount.
  React.useEffect(() => clearTimer, [])

  return (
    <View
      style={styles.anchor}
      onLayout={(event) => setAnchorHeight(event.nativeEvent.layout.height)}
    >
      <Pressable
        onLongPress={show}
        onPressOut={hide}
        accessibilityRole="button"
        accessibilityHint={label}
      >
        {children}
      </Pressable>

      {visible ? (
        <View
          pointerEvents="none"
          style={[styles.bubbleRow, { bottom: anchorHeight + 8 }]}
        >
          <Animated.View
            style={[
              styles.bubble,
              {
                backgroundColor: colors.foreground,
                opacity: fade.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                  extrapolate: "clamp",
                }),
                transform: [
                  {
                    translateY: fade.interpolate({
                      inputRange: [0, 1],
                      outputRange: [4, 0],
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <MobileText variant="caption" style={{ color: colors.background }}>
              {label}
            </MobileText>
          </Animated.View>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  anchor: {
    alignSelf: "flex-start",
  },
  bubbleRow: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    // Float above neighbouring content while shown.
    zIndex: 30,
  },
  bubble: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: metrics.radius.sm,
  },
})
