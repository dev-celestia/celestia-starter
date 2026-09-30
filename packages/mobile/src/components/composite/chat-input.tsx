import * as React from "react"
import {
  Pressable,
  View,
  StyleSheet,
  Animated,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { pressInTiming, springTo } from "../../motion"
import { MobileText } from "../primitive/text"
import { MobileTextInput } from "../primitive/input"
import { metrics } from "../../tokens"
import { hapticLight } from "../../utils"

export interface MobileChatInputProps {
  /**
   * Current draft text.
   */
  value: string
  /**
   * Called on every edit.
   */
  onChangeText: (text: string) => void
  /**
   * Called when the send button (or the keyboard send key) commits. The
   * consumer clears `value` afterwards — this component holds no state.
   */
  onSend: () => void
  /**
   * Placeholder text.
   * @default 'Message…'
   */
  placeholder?: string
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * MobileChatInput
 *
 * Rounded input + circular send button, the composer row of a chat screen.
 *
 * Send is enabled only when `value.trim()` is non-empty — a whitespace-only
 * message is never a message, and disabling beats validating. The keyboard's
 * send key routes through the same handler so both paths haptic and behave
 * identically. The draft is the consumer's state, which keeps this component
 * usable with optimistic-send flows.
 */
export function MobileChatInput({
  value,
  onChangeText,
  onSend,
  placeholder = "Message…",
  disabled = false,
  style,
  testID,
}: MobileChatInputProps) {
  const { colors } = useMobileTheme()
  const pressAnim = React.useRef(new Animated.Value(1)).current

  const canSend = !disabled && value.trim().length > 0

  const handleSend = () => {
    if (!canSend) return
    hapticLight()
    onSend()
  }

  const handlePressIn = () => {
    if (!canSend) return
    pressInTiming(pressAnim, 0.9, 80).start()
  }

  const handlePressOut = () => {
    if (!canSend) return
    springTo(pressAnim, 1).start()
  }

  return (
    <View testID={testID} style={[styles.row, style]}>
      <MobileTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={!disabled}
        multiline
        returnKeyType="send"
        blurOnSubmit={false}
        onSubmitEditing={handleSend}
        accessibilityLabel={placeholder}
        containerStyle={styles.input}
      />

      <AnimatedPressable
        onPress={handleSend}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        accessibilityState={{ disabled: !canSend }}
        style={[
          styles.send,
          {
            backgroundColor: canSend ? colors.primary : colors.mutedBackground,
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale: pressAnim }],
          },
        ]}
      >
        <MobileText
          variant="title"
          color={canSend ? colors.primaryForeground : colors.muted}
          style={styles.sendGlyph}
        >
          ↑
        </MobileText>
      </AnimatedPressable>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  input: {
    flex: 1,
    // Pill shape matches the circular send button beside it.
    borderRadius: metrics.radius.xl,
  },
  send: {
    width: metrics.minTouchTarget,
    height: metrics.minTouchTarget,
    borderRadius: metrics.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  sendGlyph: {
    fontWeight: "700",
    // Nudged up because "↑" sits low in its em box on both platforms.
    marginTop: -1,
  },
})
