import * as React from "react"
import { Animated, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { canUseNativeDriver, SPRING_SNAPPY } from "../../motion"
import { metrics } from "../../tokens"
import { MobileText } from "../primitive/text"

export type MobileAiAvatarState =
  | "idle"
  | "thinking"
  | "streaming"
  | "speaking"
  | "error"

export interface MobileAiAvatarProps {
  /**
   * Assistant identity mark. A glyph (text), an image node, or any node.
   * @default '✦'
   */
  glyph?: React.ReactNode
  /**
   * Live state. Drives the ring colour and whether it pulses.
   * @default 'idle'
   */
  state?: MobileAiAvatarState
  /**
   * Diameter in points.
   * @default 32
   */
  size?: number
  /**
   * Screen-reader description. Defaults to "Assistant".
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

/**
 * MobileAiAvatar
 *
 * The assistant's identity mark, with the four states a chat surface actually
 * needs: idle, thinking, streaming and speaking pulse a ring; error pins it
 * solid red.
 *
 * The ring is a real sibling view behind the disc, not a border, so the pulse
 * can scale it independently. A border would have to animate its width — a
 * layout prop that cannot ride the native driver — and would push the disc
 * around while it moved.
 *
 * Colour is never the only signal: `error` also swaps the glyph to "!" so the
 * state survives a greyscale render or a colour-blind reader.
 */
export function MobileAiAvatar({
  glyph = "\u2726",
  state = "idle",
  size = 32,
  accessibilityLabel,
  style,
  testID,
}: MobileAiAvatarProps) {
  const { colors } = useMobileTheme()
  const pulse = React.useRef(new Animated.Value(0)).current

  const isActive =
    state === "thinking" || state === "streaming" || state === "speaking"

  React.useEffect(() => {
    if (!isActive) {
      pulse.setValue(0)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: canUseNativeDriver,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: canUseNativeDriver,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [isActive, pulse])

  const ringColor =
    state === "error"
      ? colors.destructive
      : isActive
        ? colors.primary
        : colors.cardBorder

  const stateLabel =
    state === "error"
      ? "error"
      : state === "thinking"
        ? "thinking"
        : state === "streaming"
          ? "responding"
          : state === "speaking"
            ? "speaking"
            : "idle"

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${accessibilityLabel ?? "Assistant"}, ${stateLabel}`}
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        styles.container,
        style,
      ]}
    >
      {/* Pulsing ring — scaled and faded, never resized. */}
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: ringColor,
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.9],
            }),
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.35],
                }),
              },
            ],
          },
        ]}
      />

      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            borderWidth: 1,
            borderColor: ringColor,
            backgroundColor: colors.mutedBackground,
          },
          styles.center,
        ]}
      >
        {typeof glyph === "string" || typeof glyph === "number" ? (
          <MobileText
            variant={size >= 56 ? "title" : "callout"}
            style={{
              color: state === "error" ? colors.destructive : colors.primary,
              fontWeight: "700",
            }}
          >
            {state === "error" ? "!" : glyph}
          </MobileText>
        ) : (
          glyph
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: "visible",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: metrics.radius.full,
  },
})
