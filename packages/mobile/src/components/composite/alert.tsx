import * as React from "react"
import {
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"

export type MobileAlertVariant = "info" | "success" | "warning" | "destructive"

export interface MobileAlertProps {
  /**
   * Semantic tone. Drives the tint and the title colour.
   * @default 'info'
   */
  variant?: MobileAlertVariant
  /**
   * Optional bold heading.
   */
  title?: string
  /**
   * Body copy, or a custom node.
   */
  children?: React.ReactNode
  /**
   * Optional action slot, typically a small `MobileButton`.
   */
  action?: React.ReactNode
  /**
   * Renders a dismiss affordance when provided.
   */
  onDismiss?: () => void
  /**
   * Screen-reader label for the dismiss affordance.
   * @default 'Dismiss'
   */
  dismissAccessibilityLabel?: string
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
 * MobileAlert
 *
 * Inline status banner.
 *
 * The tint is produced by an absolutely-positioned overlay at 10% opacity rather
 * than an alpha colour token — the design tokens are opaque by contract, so
 * compositing is what keeps every variant on the same surface without inventing
 * a parallel set of translucent ramps.
 *
 * Announced with `accessibilityRole="alert"` so a screen reader interrupts to
 * read it, which is the point of an alert.
 */
export function MobileAlert({
  variant = "info",
  title,
  children,
  action,
  onDismiss,
  dismissAccessibilityLabel = "Dismiss",
  style,
  testID,
}: MobileAlertProps) {
  const { colors } = useMobileTheme()

  const accent =
    variant === "success"
      ? colors.success
      : variant === "warning"
        ? colors.warning
        : variant === "destructive"
          ? colors.destructive
          : colors.info

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    onDismiss?.()
  }

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      style={[
        styles.container,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
        style,
      ]}
    >
      <View
        accessible={false}
        importantForAccessibility="no"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: accent, opacity: 0.1 },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.text}>
          {title ? (
            <MobileText
              variant="callout"
              style={[styles.title, { color: accent }]}
            >
              {title}
            </MobileText>
          ) : null}

          {typeof children === "string" ? (
            <MobileText
              variant="callout"
              color="muted"
              style={title ? styles.body : undefined}
            >
              {children}
            </MobileText>
          ) : (
            children
          )}
        </View>

        {action ? <View style={styles.action}>{action}</View> : null}

        {onDismiss ? (
          <Pressable
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel={dismissAccessibilityLabel}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.dismiss}
          >
            <MobileText variant="caption" color="muted" style={styles.dismissGlyph}>
              ✕
            </MobileText>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: metrics.radius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
  },
  text: {
    flex: 1,
  },
  title: {
    fontWeight: "600",
  },
  body: {
    marginTop: 2,
  },
  action: {
    alignItems: "center",
    justifyContent: "center",
  },
  dismiss: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissGlyph: {
    fontWeight: "600",
  },
})
