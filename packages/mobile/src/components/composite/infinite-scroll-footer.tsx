import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { MobileSpinner } from "../primitive/spinner"
import { MobileButton } from "../primitive/button"

export type MobileInfiniteScrollFooterState = "loading" | "error" | "end"

export interface MobileInfiniteScrollFooterProps {
  /**
   * Which tail state the list is in.
   */
  state: MobileInfiniteScrollFooterState
  /**
   * Retry handler for the error state. The Retry button is omitted when no
   * handler is given — a button that cannot retry is a lie.
   */
  onRetry?: () => void
  /**
   * Caption for the end state.
   * @default "You're all caught up"
   */
  endLabel?: string
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

/**
 * MobileInfiniteScrollFooter
 *
 * The tail of an infinite list: spinner while fetching, an error row with
 * Retry when the page failed, and a muted end-of-content line so the user
 * knows the list stopped on purpose rather than broke silently.
 */
export function MobileInfiniteScrollFooter({
  state,
  onRetry,
  endLabel = "You're all caught up",
  style,
}: MobileInfiniteScrollFooterProps) {
  const { colors } = useMobileTheme()

  if (state === "loading") {
    return (
      <View style={[styles.container, style]}>
        <MobileSpinner size="small" />
        <MobileText variant="caption" color="muted">
          Loading more…
        </MobileText>
      </View>
    )
  }

  if (state === "error") {
    return (
      <View
        style={[styles.container, style]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
      >
        <MobileText
          variant="caption"
          style={{ color: colors.destructive, textAlign: "center" }}
        >
          Couldn’t load more
        </MobileText>
        {onRetry ? (
          <MobileButton variant="default" size="sm" onPress={onRetry}>
            Retry
          </MobileButton>
        ) : null}
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      <MobileText variant="caption" color="muted" style={styles.end}>
        {endLabel}
      </MobileText>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  end: {
    textAlign: "center",
  },
})
