import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight, hapticMedium, hitSlopFor } from "../../utils"
import { MobileSpinner } from "../primitive/spinner"

export type MobileVoiceState = "idle" | "recording" | "processing"

export interface MobileVoiceButtonProps {
  /**
   * Microphone state. `recording` swaps the glyph for a stop square and pulses
   * a ring; `processing` shows a spinner.
   * @default 'idle'
   */
  state?: MobileVoiceState
  /**
   * Fired on tap. Pair with `onPressIn`/`onPressOut` instead for push-to-talk.
   */
  onPress?: () => void
  /**
   * Fired the moment the finger lands — use for push-to-talk start.
   */
  onPressIn?: () => void
  /**
   * Fired when the finger lifts — use for push-to-talk end.
   */
  onPressOut?: () => void
  /**
   * Diameter in points.
   * @default metrics.minTouchTarget
   */
  size?: number
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * Optional style override for the wrapper.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const STATE_LABEL: Record<MobileVoiceState, string> = {
  idle: "Start voice input",
  recording: "Stop recording",
  processing: "Transcribing",
}

/**
 * Drawn microphone mark — capsule, stem, base. Structural marks are the one
 * thing this package draws itself rather than taking as a prop, and a mic is
 * structural to a voice button.
 */
function MicGlyph({ color, size }: { color: string; size: number }) {
  const bodyWidth = size * 0.24
  const bodyHeight = size * 0.4
  return (
    <View style={glyphStyles.container}>
      <View
        style={{
          width: bodyWidth,
          height: bodyHeight,
          borderRadius: bodyWidth / 2,
          borderWidth: 1.6,
          borderColor: color,
        }}
      />
      <View
        style={{
          width: 1.6,
          height: size * 0.1,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          width: size * 0.32,
          height: 1.6,
          borderRadius: 1,
          backgroundColor: color,
        }}
      />
    </View>
  )
}

const glyphStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
})

/**
 * MobileVoiceButton
 *
 * The microphone control for a prompt composer, in its three real states:
 * idle, recording and transcribing.
 *
 * It supports **both** interaction models, because the platform split is real:
 * a tap (`onPress`) for tap-to-start/tap-to-stop, and press-in/press-out for
 * push-to-talk. The caller picks by supplying the handlers; the component never
 * assumes one.
 *
 * Recording is announced by shape as well as colour — the glyph becomes a
 * filled stop square — and the pulsing ring uses `scale` + `opacity` so it
 * stays on the native driver.
 */
export function MobileVoiceButton({
  state = "idle",
  onPress,
  onPressIn,
  onPressOut,
  size = metrics.minTouchTarget,
  disabled = false,
  style,
  testID,
}: MobileVoiceButtonProps) {
  const { colors } = useMobileTheme()
  const pulse = React.useRef(new Animated.Value(0)).current
  const isRecording = state === "recording"

  React.useEffect(() => {
    if (!isRecording) {
      pulse.setValue(0)
      return
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [isRecording, pulse])

  const background = isRecording ? colors.destructive : colors.mutedBackground
  const glyphColor = isRecording
    ? colors.destructiveForeground
    : colors.foreground

  const slop = hitSlopFor(size)

  const handlePress = () => {
    if (disabled) return
    if (isRecording) hapticMedium()
    else hapticLight()
    onPress?.()
  }

  return (
    <View style={[{ width: size, height: size }, style]}>
      {isRecording ? (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: size / 2,
              borderWidth: 2,
              borderColor: colors.destructive,
              opacity: pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.8],
              }),
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.4],
                  }),
                },
              ],
            },
          ]}
        />
      ) : null}

      <Pressable
        onPress={onPress ? handlePress : undefined}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || state === "processing"}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={STATE_LABEL[state]}
        accessibilityState={{ disabled, busy: state === "processing" }}
        hitSlop={{ top: slop, bottom: slop, left: 4, right: 4 }}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: background,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {state === "processing" ? (
          <MobileSpinner size="small" color={colors.muted} />
        ) : isRecording ? (
          <View
            style={[
              styles.stopSquare,
              { backgroundColor: glyphColor, borderRadius: 2 },
            ]}
          />
        ) : (
          <MicGlyph color={glyphColor} size={size} />
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  stopSquare: {
    width: 14,
    height: 14,
  },
})
