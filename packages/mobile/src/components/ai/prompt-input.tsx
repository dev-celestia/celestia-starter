import * as React from "react"
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight, hitSlopFor } from "../../utils"
import { MobileText } from "../primitive/text"
import { MobileTextInput } from "../primitive/input"

export interface MobilePromptInputProps {
  /**
   * Current draft. Owned by the consumer, so optimistic-send flows work.
   */
  value: string
  /**
   * Called on every edit.
   */
  onChangeText: (text: string) => void
  /**
   * Called when send commits — the send button or the keyboard's send key.
   */
  onSend: () => void
  /**
   * Called when stop commits. Required for the stop affordance to appear while
   * `generating`.
   */
  onStop?: () => void
  /**
   * Swaps the send button for a stop button and blocks sending.
   * @default false
   */
  generating?: boolean
  /**
   * Slot above the field — typically `MobileAttachmentTray`.
   */
  attachments?: React.ReactNode
  /**
   * Model name shown on the selector chip.
   */
  modelLabel?: string
  /**
   * Makes the model chip pressable.
   */
  onModelPress?: () => void
  /**
   * Slot at the start of the action row — typically `MobileVoiceButton`.
   */
  leading?: React.ReactNode
  /**
   * Slot at the end of the action row, before send.
   */
  trailing?: React.ReactNode
  /**
   * Placeholder text.
   * @default 'Ask anything…'
   */
  placeholder?: string
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * Character cap. Shows a counter and marks it destructive at the limit.
   */
  maxLength?: number
  /**
   * Helper line under the field, e.g. "Enter to send".
   */
  hint?: string
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const SEND_SIZE = 40
const MODEL_CHIP_HEIGHT = 28

/**
 * MobilePromptInput
 *
 * The AI composer: attachments, a multi-line field, a model selector, and a
 * send button that becomes a stop button while the model is responding.
 *
 * Three deliberate choices:
 *
 * - **Send is disabled on an empty draft, unlike a form submit.** The package's
 *   rule against disabled submit buttons exists because a form's *validity* is
 *   invisible — here the draft is on screen and empty, so "nothing to send" is
 *   self-evident rather than a puzzle.
 * - **The keyboard's send key routes through the same handler** as the button,
 *   so both paths haptic and behave identically, and the keyboard stays up
 *   (`blurOnSubmit={false}`) for a follow-up turn.
 * - **Stop replaces send in place.** Moving stop somewhere else while the model
 *   responds would cost the user a hunt at the exact moment they want to
 *   interrupt.
 *
 * State is entirely the consumer's: this component never clears the draft.
 */
export function MobilePromptInput({
  value,
  onChangeText,
  onSend,
  onStop,
  generating = false,
  attachments,
  modelLabel,
  onModelPress,
  leading,
  trailing,
  placeholder = "Ask anything…",
  disabled = false,
  maxLength,
  hint,
  style,
  testID,
}: MobilePromptInputProps) {
  const { colors } = useMobileTheme()

  const trimmedLength = value.trim().length
  const canSend = !disabled && !generating && trimmedLength > 0
  const atLimit = maxLength != null && value.length >= maxLength

  const handleSend = () => {
    if (!canSend) return
    hapticLight()
    onSend()
  }

  const handleStop = () => {
    if (!onStop) return
    hapticLight()
    onStop()
  }

  const sendSlop = hitSlopFor(SEND_SIZE)

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderRadius: metrics.radius.xl,
        },
        style,
      ]}
    >
      {attachments ? (
        <View style={styles.attachments}>{attachments}</View>
      ) : null}

      <MobileTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={!disabled}
        multiline
        maxLength={maxLength}
        returnKeyType="send"
        blurOnSubmit={false}
        onSubmitEditing={handleSend}
        accessibilityLabel={placeholder}
        containerStyle={styles.input}
      />

      {hint ? (
        <MobileText variant="caption" color="muted" style={styles.hint}>
          {hint}
        </MobileText>
      ) : null}

      <View style={styles.actions}>
        {leading ? <View style={styles.slot}>{leading}</View> : null}

        {modelLabel ? (
          <Pressable
            onPress={
              onModelPress
                ? () => {
                    hapticLight()
                    onModelPress()
                  }
                : undefined
            }
            disabled={!onModelPress}
            accessibilityRole={onModelPress ? "button" : undefined}
            accessibilityLabel={`Model: ${modelLabel}`}
            hitSlop={{
              top: hitSlopFor(MODEL_CHIP_HEIGHT),
              bottom: hitSlopFor(MODEL_CHIP_HEIGHT),
            }}
            style={[
              styles.modelChip,
              {
                minHeight: MODEL_CHIP_HEIGHT,
                borderRadius: metrics.radius.full,
                backgroundColor: colors.mutedBackground,
                borderColor: colors.border,
              },
            ]}
          >
            <MobileText
              variant="caption"
              numberOfLines={1}
              style={[styles.modelLabel, { color: colors.foreground }]}
            >
              {modelLabel}
            </MobileText>
            {onModelPress ? (
              <MobileText variant="caption" color="muted">
                {"\u25BE"}
              </MobileText>
            ) : null}
          </Pressable>
        ) : null}

        {trailing ? <View style={styles.slot}>{trailing}</View> : null}

        <View style={styles.spacer} />

        {maxLength != null ? (
          <MobileText
            variant="caption"
            tabular
            color={atLimit ? colors.destructive : colors.muted}
            style={styles.counter}
          >
            {`${value.length}/${maxLength}`}
          </MobileText>
        ) : null}

        {generating && onStop ? (
          <Pressable
            onPress={handleStop}
            accessibilityRole="button"
            accessibilityLabel="Stop generating"
            hitSlop={{ top: sendSlop, bottom: sendSlop, left: 4, right: 4 }}
            style={[styles.send, { backgroundColor: colors.foreground }]}
          >
            <View
              style={[
                styles.stopSquare,
                { backgroundColor: colors.background, borderRadius: 2 },
              ]}
            />
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send prompt"
            accessibilityState={{ disabled: !canSend }}
            hitSlop={{ top: sendSlop, bottom: sendSlop, left: 4, right: 4 }}
            style={[
              styles.send,
              {
                backgroundColor: canSend
                  ? colors.primary
                  : colors.mutedBackground,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <MobileText
              variant="title"
              style={[
                styles.sendGlyph,
                { color: canSend ? colors.primaryForeground : colors.muted },
              ]}
            >
              {"\u2191"}
            </MobileText>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  attachments: {
    marginBottom: 2,
  },
  input: {
    borderRadius: metrics.radius.lg,
    // Multi-line drafts grow to a ceiling then scroll, rather than pushing the
    // composer off the top of the screen.
    maxHeight: 132,
  },
  hint: {
    paddingHorizontal: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  slot: {
    alignItems: "center",
    justifyContent: "center",
  },
  modelChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    maxWidth: 160,
  },
  modelLabel: {
    fontWeight: "600",
  },
  spacer: {
    flex: 1,
  },
  counter: {
    // Tabular so the counter does not jitter as digits are added.
    marginRight: 2,
  },
  send: {
    width: SEND_SIZE,
    height: SEND_SIZE,
    borderRadius: SEND_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sendGlyph: {
    fontWeight: "700",
    // Nudged up because "↑" sits low in its em box on both platforms.
    marginTop: -1,
  },
  stopSquare: {
    width: 12,
    height: 12,
  },
})
