import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileText } from "../primitive/text"
import { MobileButton } from "../primitive/button"

export type MobileAiErrorKind =
  | "rate_limit"
  | "timeout"
  | "context_length"
  | "content_filter"
  | "network"
  | "unknown"

export interface MobileAiErrorCardProps {
  /**
   * Machine-readable failure category. Drives the default title, body and
   * whether a retry is offered.
   * @default 'unknown'
   */
  kind?: MobileAiErrorKind
  /**
   * Overrides the default title for `kind`.
   */
  title?: string
  /**
   * Overrides the default body for `kind`.
   */
  message?: string
  /**
   * Fires from the retry action. When omitted the card shows no action.
   */
  onRetry?: () => void
  /**
   * Retry button label.
   * @default 'Try again'
   */
  retryLabel?: string
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
 * Default copy per failure kind.
 *
 * The point of naming the *kind* is that the four common failures need four
 * different user actions: wait, shorten the input, rephrase, or reconnect.
 * "Something went wrong" tells the user none of that, so each kind gets a
 * sentence that says what to do next.
 */
const COPY: Record<
  MobileAiErrorKind,
  { title: string; message: string; retryable: boolean }
> = {
  rate_limit: {
    title: "Too many requests",
    message: "You have hit the rate limit. Wait a moment, then try again.",
    retryable: true,
  },
  timeout: {
    title: "The response timed out",
    message: "The model took too long to answer. Retrying usually works.",
    retryable: true,
  },
  context_length: {
    title: "Conversation too long",
    message:
      "This thread no longer fits the model's context window. Start a new chat or remove some attachments.",
    retryable: false,
  },
  content_filter: {
    title: "Response blocked",
    message:
      "The request was declined by a safety filter. Rephrase it and try again.",
    retryable: false,
  },
  network: {
    title: "You are offline",
    message: "Check your connection. The request was not sent.",
    retryable: true,
  },
  unknown: {
    title: "Something went wrong",
    message: "The response could not be generated. Try again in a moment.",
    retryable: true,
  },
}

/**
 * MobileAiErrorCard
 *
 * A failed turn, with a title that names the failure and a body that names the
 * fix.
 *
 * The card is toned with a low-opacity destructive layer over the surface
 * rather than a filled red — a failed turn is inline in a transcript, and a
 * saturated block would shout louder than the answer above it. The retry
 * affordance is suppressed for the two kinds where retrying the same input
 * cannot help (`context_length`, `content_filter`), because offering a button
 * that is guaranteed to fail is worse than offering none.
 */
export function MobileAiErrorCard({
  kind = "unknown",
  title,
  message,
  onRetry,
  retryLabel = "Try again",
  style,
  testID,
}: MobileAiErrorCardProps) {
  const { colors } = useMobileTheme()
  const copy = COPY[kind]

  const showRetry = onRetry != null && copy.retryable

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
          borderRadius: metrics.radius.md,
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.destructive,
            opacity: 0.1,
            borderRadius: metrics.radius.md,
          },
        ]}
      />

      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.destructive,
              borderRadius: metrics.radius.full,
            },
          ]}
        >
          <MobileText
            variant="caption"
            style={{ color: colors.destructiveForeground, fontWeight: "700" }}
          >
            !
          </MobileText>
        </View>
        <MobileText variant="callout" style={styles.title}>
          {title ?? copy.title}
        </MobileText>
      </View>

      <MobileText variant="caption" color="muted" style={styles.message}>
        {message ?? copy.message}
      </MobileText>

      {showRetry ? (
        <MobileButton
          variant="outline"
          size="sm"
          onPress={onRetry}
          containerStyle={styles.action}
        >
          {retryLabel}
        </MobileButton>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontWeight: "600",
  },
  message: {
    lineHeight: 18,
  },
  action: {
    marginTop: 2,
  },
})
