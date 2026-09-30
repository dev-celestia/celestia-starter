import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"

export interface MobileBalanceCardProps {
  /**
   * Caption above the amount, e.g. "Total balance".
   */
  label?: string
  /**
   * Pre-formatted balance, rendered large and tabular.
   */
  amount: string
  /**
   * Change indicator, rendered as a pill: success/destructive get their
   * semantic fills, muted gets an outlined pill.
   */
  delta?: string
  /**
   * Pill treatment for `delta`.
   * @default 'muted'
   */
  deltaTone?: "success" | "destructive" | "muted"
  /**
   * Slot under the amount, typically top-up / send actions.
   */
  children?: React.ReactNode
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
 * MobileBalanceCard
 *
 * Primary-tinted hero card: big tabular amount on the brand colour, optional
 * delta pill, and an actions slot.
 *
 * The delta rides on a pill rather than bare text because the card's own fill
 * is the brand red — semantic green/red glyphs on top of it would fail
 * contrast. The pill brings its own foreground pair, so every tone stays
 * legible in light and dark. Everything on the card is `primaryForeground`;
 * nothing reaches for a second accent.
 */
export function MobileBalanceCard({
  label,
  amount,
  delta,
  deltaTone = "muted",
  children,
  style,
  testID,
}: MobileBalanceCardProps) {
  const { colors } = useMobileTheme()

  const pillStyle: ViewStyle =
    deltaTone === "success"
      ? { backgroundColor: colors.success }
      : deltaTone === "destructive"
        ? { backgroundColor: colors.destructive }
        : {
            // Outlined pill: no translucent-fill guesswork on a chromatic bg.
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: colors.primaryForeground,
          }
  const pillTextColor =
    deltaTone === "success"
      ? colors.successForeground
      : deltaTone === "destructive"
        ? colors.destructiveForeground
        : colors.primaryForeground

  return (
    <View
      testID={testID}
      accessibilityLabel={`${label ?? "Balance"}: ${amount}${delta ? `, ${delta}` : ""}`}
      style={[
        styles.card,
        { backgroundColor: colors.primary, borderRadius: metrics.radius.xl },
        style,
      ]}
    >
      {label ? (
        <MobileText variant="caption" color={colors.primaryForeground} style={styles.label}>
          {label}
        </MobileText>
      ) : null}

      <View style={styles.amountRow}>
        <MobileText variant="display" color={colors.primaryForeground} tabular>
          {amount}
        </MobileText>
        {delta ? (
          <View style={[styles.pill, pillStyle]}>
            <MobileText variant="caption" color={pillTextColor} tabular>
              {delta}
            </MobileText>
          </View>
        ) : null}
      </View>

      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    gap: 4,
  },
  label: {
    opacity: 0.8,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: metrics.radius.full,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
})
