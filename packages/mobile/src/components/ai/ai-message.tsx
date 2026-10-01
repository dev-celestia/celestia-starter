import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileText } from "../primitive/text"
import { MobileStreamingText } from "./streaming-text"

export type MobileAiMessageRole = "user" | "assistant" | "system" | "tool"

export interface MobileAiMessageProps {
  /**
   * Who produced the turn. Drives alignment, fill and labelling.
   */
  role: MobileAiMessageRole
  /**
   * Plain-text body. Ignored when `children` is supplied.
   */
  text?: string
  /**
   * Rich body — a markdown renderer, `MobileCodeBlock`, citations. When
   * present it replaces the default text rendering entirely.
   */
  children?: React.ReactNode
  /**
   * Leading node for assistant/tool turns, typically `MobileAiAvatar`.
   */
  avatar?: React.ReactNode
  /**
   * Appends the streaming caret and announces "Responding". Only meaningful on
   * an assistant turn.
   * @default false
   */
  streaming?: boolean
  /**
   * Paints the body in the destructive tone — a failed turn rather than an
   * answer.
   * @default false
   */
  error?: boolean
  /**
   * Timestamp caption, e.g. "14:32".
   */
  time?: string
  /**
   * Action row rendered under the body, typically `MobileAiFeedbackBar`.
   */
  actions?: React.ReactNode
  /**
   * Wraps an assistant body in a bubble. Assistant turns are unboxed by default
   * so long answers are not constrained by a bubble's max width.
   * @default false
   */
  bubble?: boolean
  /**
   * Optional style override for the outer row.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const ROLE_LABEL: Record<MobileAiMessageRole, string> = {
  user: "You",
  assistant: "Assistant",
  system: "System",
  tool: "Tool",
}

/**
 * MobileAiMessage
 *
 * One conversational turn, laid out by role:
 *
 * - **user** — a primary-filled bubble pinned to the right, the familiar
 *   messaging shape.
 * - **assistant** — unboxed and left-aligned beside an avatar. Answers are
 *   long; a bubble would cap their width and force a scroll for prose that has
 *   room to breathe.
 * - **system** — a centred muted pill. A system note is not a speaker, so it
 *   gets no alignment side.
 * - **tool** — an assistant row whose body sits on a card, marking output the
 *   model did not write itself.
 *
 * Presentational throughout: streaming state, retry, and rating all arrive as
 * props or slots.
 */
export function MobileAiMessage({
  role,
  text,
  children,
  avatar,
  streaming = false,
  error = false,
  time,
  actions,
  bubble = false,
  style,
  testID,
}: MobileAiMessageProps) {
  const { colors } = useMobileTheme()

  const spokenText = text ?? ""
  const a11yLabel = `${ROLE_LABEL[role]}${streaming ? ", responding" : ""}: ${spokenText}`

  // ---- system ------------------------------------------------------------
  if (role === "system") {
    return (
      <View testID={testID} style={[styles.systemRow, style]}>
        <View
          style={[
            styles.systemPill,
            {
              backgroundColor: colors.mutedBackground,
              borderRadius: metrics.radius.full,
            },
          ]}
        >
          {children != null ? (
            children
          ) : (
            <MobileText
              variant="caption"
              color="muted"
              align="center"
              accessibilityLabel={a11yLabel}
            >
              {spokenText}
            </MobileText>
          )}
        </View>
      </View>
    )
  }

  // ---- user --------------------------------------------------------------
  if (role === "user") {
    return (
      <View testID={testID} style={[styles.row, styles.rowEnd, style]}>
        <View style={styles.userColumn}>
          <View
            style={[styles.userBubble, { backgroundColor: colors.primary }]}
          >
            {children != null ? (
              children
            ) : (
              <MobileText
                variant="body"
                color={colors.primaryForeground}
                accessibilityLabel={a11yLabel}
              >
                {spokenText}
              </MobileText>
            )}
          </View>
          {time ? (
            <MobileText
              variant="caption"
              color="muted"
              tabular
              style={styles.timeEnd}
            >
              {time}
            </MobileText>
          ) : null}
        </View>
      </View>
    )
  }

  // ---- assistant / tool --------------------------------------------------
  const body =
    children != null ? (
      children
    ) : (
      <MobileStreamingText
        text={spokenText}
        streaming={streaming}
        color={error ? colors.destructive : colors.foreground}
      />
    )

  const wrappedBody =
    bubble || role === "tool" ? (
      <View
        style={[
          styles.toolBody,
          {
            backgroundColor:
              role === "tool" ? colors.surface : colors.background,
            borderColor: colors.cardBorder,
            borderRadius: metrics.radius.lg,
          },
        ]}
      >
        {role === "tool" ? (
          <MobileText variant="label" color="muted" style={styles.toolLabel}>
            TOOL
          </MobileText>
        ) : null}
        {body}
      </View>
    ) : (
      body
    )

  return (
    <View testID={testID} style={[styles.row, styles.rowStart, style]}>
      {avatar ? <View style={styles.avatar}>{avatar}</View> : null}

      <View style={styles.assistantColumn}>
        <View
          accessible={children == null}
          accessibilityLabel={children == null ? a11yLabel : undefined}
        >
          {wrappedBody}
        </View>

        {time ? (
          <View style={styles.meta}>
            <MobileText variant="caption" color="muted" tabular>
              {time}
            </MobileText>
          </View>
        ) : null}

        {actions ? <View style={styles.actions}>{actions}</View> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginVertical: 4,
  },
  systemRow: {
    alignItems: "center",
    marginVertical: 6,
  },
  systemPill: {
    maxWidth: "86%",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  rowStart: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 10,
  },
  rowEnd: {
    justifyContent: "flex-end",
  },
  avatar: {
    // Optically aligns the avatar with the first line of the body.
    marginTop: 2,
  },
  userColumn: {
    maxWidth: "82%",
    alignItems: "flex-end",
    gap: 2,
  },
  userBubble: {
    borderRadius: metrics.radius.lg,
    // Squared corner on the speaker's side — the "tail" that makes a wall of
    // bubbles scannable by shape rather than by re-reading alignment.
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  assistantColumn: {
    flex: 1,
    gap: 6,
  },
  toolBody: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  toolLabel: {
    letterSpacing: 0.6,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeEnd: {
    textAlign: "right",
  },
  actions: {
    marginTop: 2,
  },
})
