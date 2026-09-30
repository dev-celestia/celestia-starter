import * as React from "react"
import { StyleSheet, View } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { MobileButton } from "../primitive/button"
import { metrics } from "../../tokens"

export interface MobileErrorBoundaryProps {
  /**
   * Custom fallback renderer. `reset` clears the captured error and retries
   * rendering the children.
   */
  fallback?: (error: Error, reset: () => void) => React.ReactNode
  /**
   * Subtree to guard.
   */
  children: React.ReactNode
}

interface MobileErrorBoundaryState {
  error: Error | null
}

/**
 * MobileErrorBoundary
 *
 * Class-based because `getDerivedStateFromError` is the only React API that
 * catches render errors — a hook cannot. The default fallback is a
 * destructive-tinted panel with a Retry button that resets the captured
 * error so the subtree renders again.
 *
 * Reset is optimistic: if the underlying bug is deterministic the boundary
 * simply re-catches, which is still better than a dead screen.
 */
export class MobileErrorBoundary extends React.Component<
  MobileErrorBoundaryProps,
  MobileErrorBoundaryState
> {
  override state: MobileErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): MobileErrorBoundaryState {
    return { error }
  }

  override componentDidCatch(
    error: Error,
    errorInfo: React.ErrorInfo
  ): void {
    // Presentational package: no logger to hand, but a silent catch makes
    // production crashes invisible, so it lands on the console.
    console.error("MobileErrorBoundary caught:", error, errorInfo)
  }

  private reset = () => {
    this.setState({ error: null })
  }

  override render() {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.fallback) return this.props.fallback(error, this.reset)
    return <DefaultFallback error={error} reset={this.reset} />
  }
}

interface DefaultFallbackProps {
  error: Error
  reset: () => void
}

/**
 * Function component so the default panel can read theme colours via
 * `useMobileTheme` — the class boundary itself cannot use hooks.
 */
function DefaultFallback({ error, reset }: DefaultFallbackProps) {
  const { colors } = useMobileTheme()

  return (
    <View style={styles.wrapper}>
      <View
        accessibilityRole="alert"
        style={[
          styles.panel,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        {/* Tone carried by a 12% overlay rather than coloured text, the same
            trick the toast uses, so the copy stays at full contrast. */}
        <View
          accessible={false}
          importantForAccessibility="no"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.destructive, opacity: 0.12 },
          ]}
        />

        <MobileText variant="title" align="center">
          Something went wrong
        </MobileText>
        <MobileText
          variant="caption"
          color="muted"
          align="center"
          numberOfLines={3}
        >
          {error.message}
        </MobileText>
        <MobileButton
          variant="default"
          onPress={reset}
          accessibilityLabel="Retry"
          containerStyle={styles.retry}
        >
          Retry
        </MobileButton>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    width: "100%",
    alignItems: "center",
    gap: 8,
    padding: 24,
    borderRadius: metrics.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  retry: {
    marginTop: 8,
  },
})
