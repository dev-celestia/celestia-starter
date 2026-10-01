import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { clamp, formatCompactNumber } from "../../utils"
import { MobileText } from "../primitive/text"
import { MobileProgress } from "../primitive/progress"
import { MobileButton } from "../primitive/button"

export interface MobileAiUsageCardProps {
  /**
   * Amount consumed in the current period.
   */
  used: number
  /**
   * The period's allowance.
   */
  limit: number
  /**
   * Unit noun for the readout, e.g. "credits", "messages", "tokens".
   * @default 'credits'
   */
  unit?: string
  /**
   * Plan name shown in the header.
   */
  planLabel?: string
  /**
   * Reset caption, e.g. "Renews 12 Oct".
   */
  renewsAt?: string
  /**
   * Fires from the upgrade action. Omit to hide the action.
   */
  onUpgrade?: () => void
  /**
   * Upgrade button label.
   * @default 'Upgrade'
   */
  upgradeLabel?: string
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
 * MobileAiUsageCard
 *
 * The plan and quota card — how much of the allowance is left this period.
 *
 * The bar goes destructive **only when the allowance is spent**, and the
 * readout switches to "used / limit" phrasing either way, so "0 left" is never
 * implied by an empty bar alone. The upgrade action is omitted entirely rather
 * than disabled when there is nothing to upgrade to — a dead button on a quota
 * card is the worst possible place for one.
 */
export function MobileAiUsageCard({
  used,
  limit,
  unit = "credits",
  planLabel,
  renewsAt,
  onUpgrade,
  upgradeLabel = "Upgrade",
  style,
  testID,
}: MobileAiUsageCardProps) {
  const { colors } = useMobileTheme()

  const safeLimit = limit > 0 ? limit : 1
  const ratio = clamp(used / safeLimit, 0, 1)
  const exhausted = used >= safeLimit
  const remaining = Math.max(0, safeLimit - used)

  return (
    <View
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderRadius: metrics.radius.lg,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <MobileText variant="callout" style={styles.plan}>
          {planLabel ?? "Usage"}
        </MobileText>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: exhausted
                ? colors.destructive
                : colors.mutedBackground,
              borderRadius: metrics.radius.full,
            },
          ]}
        >
          <MobileText
            variant="label"
            style={{
              color: exhausted ? colors.destructiveForeground : colors.muted,
            }}
          >
            {exhausted ? "LIMIT REACHED" : `${Math.round(ratio * 100)}%`}
          </MobileText>
        </View>
      </View>

      <MobileProgress
        value={ratio}
        color={exhausted ? colors.destructive : colors.primary}
        height={6}
      />

      <View style={styles.readout}>
        <MobileText variant="caption" color="muted" tabular>
          {`${formatCompactNumber(used)} / ${formatCompactNumber(limit)} ${unit}`}
        </MobileText>
        <MobileText
          variant="caption"
          tabular
          color={exhausted ? colors.destructive : colors.muted}
        >
          {exhausted
            ? "No allowance left"
            : `${formatCompactNumber(remaining)} left`}
        </MobileText>
      </View>

      {renewsAt ? (
        <MobileText variant="caption" color="muted">
          {renewsAt}
        </MobileText>
      ) : null}

      {onUpgrade ? (
        <MobileButton
          variant={exhausted ? "secondary" : "outline"}
          size="sm"
          onPress={onUpgrade}
          containerStyle={styles.action}
        >
          {upgradeLabel}
        </MobileButton>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  plan: {
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  readout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  action: {
    marginTop: 2,
  },
})
