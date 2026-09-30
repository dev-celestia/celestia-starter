import * as React from "react"
import { StyleSheet, View } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileGrid } from "../primitive/grid"
import { MobileText } from "../primitive/text"
import { MobileBalanceCard } from "../composite/balance-card"
import { MobileStatCard } from "../composite/stat-card"
import { MobileTransactionRow } from "../composite/transaction-row"
import { MobileScreen, type MobileScreenProps } from "./screen"

export interface MobileDashboardScreenProps
  extends Omit<MobileScreenProps, "children" | "footer"> {
  /** Salutation line, e.g. "Good morning". @default 'Welcome' */
  greeting?: string
  /** User's name, rendered as the display line under the greeting. */
  name?: string
  /** Optional balance hero card. */
  balance?: { label?: string; amount: string; delta?: string }
  /** Stat tiles, laid out two per row. */
  stats?: {
    label: string
    value: string
    delta?: string
    deltaTone?: "success" | "destructive" | "muted"
  }[]
  /** Recent activity rows under the "Recent" heading. */
  transactions?: {
    id: string
    title: string
    subtitle?: string
    amount: string
    amountTone?: "default" | "success" | "destructive"
    time?: string
  }[]
  /** Called with the transaction's id when a row is pressed. */
  onTransactionPress?: (id: string) => void
  /** Heading above the transaction list. @default 'Recent' */
  recentLabel?: string
  /**
   * Free-form slot between the stats and the recent list — conventionally a
   * `MobileChartLine` or `MobileSparkline`.
   */
  children?: React.ReactNode
}

/**
 * MobileDashboardScreen
 *
 * Home/overview page: greeting, balance card, a two-column stat grid, an
 * optional chart slot, and recent activity.
 *
 * Every block is opt-in through its prop — a dashboard is a composition of
 * summaries rather than a fixed form, and an app with no balance concept should
 * not have to hide a balance card. The one thing that is not opt-in is the
 * order: greeting → balance → stats → chart → recent, top-to-bottom by
 * decreasing priority, which is the reading order thumbs expect from a home
 * screen.
 *
 * The recent list is capped by what the caller passes; a dashboard teases the
 * last few activities and links out to the full list rather than paging here.
 */
export function MobileDashboardScreen({
  greeting = "Welcome",
  name,
  balance,
  stats,
  transactions,
  onTransactionPress,
  recentLabel = "Recent",
  children,
  contentContainerStyle,
  ...screenProps
}: MobileDashboardScreenProps) {
  const { colors } = useMobileTheme()

  const hasTransactions = Boolean(transactions && transactions.length > 0)

  return (
    <MobileScreen
      {...screenProps}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      <View style={styles.greetingBlock}>
        <MobileText variant="callout" color="muted">
          {greeting}
        </MobileText>
        {name ? (
          <MobileText
            variant="heading"
            accessibilityRole="header"
            style={styles.name}
          >
            {name}
          </MobileText>
        ) : null}
      </View>

      {balance ? (
        <MobileBalanceCard
          label={balance.label}
          amount={balance.amount}
          delta={balance.delta}
        />
      ) : null}

      {stats && stats.length > 0 ? (
        <MobileGrid columns={2} gap={12}>
          {stats.map((stat, index) => (
            <MobileStatCard
              key={`${stat.label}-${index}`}
              label={stat.label}
              value={stat.value}
              delta={stat.delta}
              deltaTone={stat.deltaTone}
            />
          ))}
        </MobileGrid>
      ) : null}

      {children}

      {hasTransactions ? (
        <View style={styles.recentBlock}>
          <MobileText variant="label" color="muted" style={styles.recentLabel}>
            {recentLabel}
          </MobileText>
          <View
            style={[
              styles.surface,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            {transactions?.map((transaction) => (
              <MobileTransactionRow
                key={transaction.id}
                title={transaction.title}
                subtitle={transaction.subtitle}
                amount={transaction.amount}
                amountTone={transaction.amountTone}
                time={transaction.time}
                onPress={
                  onTransactionPress
                    ? () => onTransactionPress(transaction.id)
                    : undefined
                }
              />
            ))}
          </View>
        </View>
      ) : null}
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 20,
  },
  greetingBlock: {
    width: "100%",
  },
  name: {
    marginTop: 2,
    marginBottom: 0,
  },
  recentBlock: {
    width: "100%",
  },
  recentLabel: {
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  surface: {
    borderRadius: metrics.radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
})
