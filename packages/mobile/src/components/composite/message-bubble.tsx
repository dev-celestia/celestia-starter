import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"

export interface MobileMessageBubbleProps {
  /**
   * Message body.
   */
  text: string
  /**
   * Outgoing message: primary fill, aligned to the right edge.
   * @default false
   */
  mine?: boolean
  /**
   * Timestamp caption, e.g. "14:32" or "Delivered 2m ago".
   */
  time?: string
  /**
   * Delivery state, shown as a glyph suffix: sending ✓ (dimmed), sent ✓✓,
   * failed ! (destructive). Only meaningful on outgoing messages.
   */
  status?: "sending" | "sent" | "failed"
  /**
   * Optional style override for the outer alignment row.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileMessageBubble
 *
 * One chat message: mine is primary-filled and right-aligned with a "tail"
 * (squared bottom-right corner); theirs is a neutral surface, left-aligned,
 * tail mirrored. The tail is what makes a wall of bubbles scannable — the eye
 * tracks the sender by corner shape, not by re-reading the alignment.
 *
 * Status glyphs follow the messaging convention (✓ sending, ✓✓ sent, !
 * failed). Colour is never the only carrier: the failed "!" differs in shape
 * as well as hue.
 */
export function MobileMessageBubble({
  text,
  mine = false,
  time,
  status,
  style,
  testID,
}: MobileMessageBubbleProps) {
  const { colors } = useMobileTheme()

  const bubbleStyle = mine
    ? {
        backgroundColor: colors.primary,
        borderBottomRightRadius: 4,
      }
    : {
        backgroundColor: colors.surface,
        borderBottomLeftRadius: 4,
      }

  const statusGlyph =
    status === "failed" ? "!" : status === "sent" ? "✓✓" : status === "sending" ? "✓" : null
  const statusColor =
    status === "failed"
      ? colors.destructive
      : mine
        ? colors.primaryForeground
        : colors.muted

  return (
    <View
      testID={testID}
      style={[styles.row, mine ? styles.rowMine : styles.rowTheirs, style]}
    >
      <View style={[styles.bubble, bubbleStyle]}>
        <MobileText
          variant="body"
          color={mine ? colors.primaryForeground : colors.foreground}
          accessibilityLabel={`${mine ? "Sent" : "Received"}: ${text}`}
        >
          {text}
        </MobileText>
        {time || statusGlyph ? (
          <View style={styles.meta}>
            {time ? (
              <MobileText
                variant="caption"
                color={mine ? colors.primaryForeground : colors.muted}
                style={mine ? styles.metaMine : undefined}
                tabular
              >
                {time}
              </MobileText>
            ) : null}
            {statusGlyph ? (
              <MobileText
                variant="caption"
                color={statusColor}
                // Dimming the single tick reads as "in flight" without needing
                // a spinner inside the bubble.
                style={status === "sending" ? styles.sending : undefined}
                accessibilityLabel={
                  status === "failed"
                    ? "Failed to send"
                    : status === "sent"
                      ? "Sent"
                      : "Sending"
                }
              >
                {statusGlyph}
              </MobileText>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginVertical: 2,
  },
  rowMine: {
    justifyContent: "flex-end",
  },
  rowTheirs: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: metrics.radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  metaMine: {
    opacity: 0.8,
  },
  sending: {
    opacity: 0.6,
  },
})
