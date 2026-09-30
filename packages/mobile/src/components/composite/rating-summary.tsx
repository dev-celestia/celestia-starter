import * as React from "react"
import { StyleSheet, View } from "react-native"
import { MobileText } from "../primitive/text"
import { MobileCard } from "../primitive/card"
import { MobileProgress } from "../primitive/progress"
import { MobileRating } from "../primitive/rating"
import { clamp } from "../../utils"

export interface MobileRatingSummaryProps {
  /**
   * Mean rating (0–5 scale), shown big and as stars.
   */
  average: number
  /**
   * Total review count. `0` renders all bars empty rather than dividing by
   * zero — a product with no reviews yet is a valid state.
   */
  total: number
  /**
   * Counts per star, ordered 5★ first: `breakdown[0]` is the number of
   * five-star reviews.
   */
  breakdown: number[]
}

/** Number of star rows rendered, 5★ down to 1★. */
const ROWS = 5

/**
 * MobileRatingSummary
 *
 * Big tabular average + stars beside a 5★→1★ histogram of progress bars.
 * Tabular numerals keep the average from jittering as it ticks; the bars
 * share one scale so proportions between rows stay honest.
 */
export function MobileRatingSummary({
  average,
  total,
  breakdown,
}: MobileRatingSummaryProps) {
  const safeTotal = Math.max(0, total)

  return (
    <MobileCard style={styles.card}>
      <View
        style={styles.averageColumn}
        accessibilityLabel={`Average ${average.toFixed(1)} out of 5, ${safeTotal} ratings`}
      >
        <MobileText variant="display" tabular style={styles.average}>
          {average.toFixed(1)}
        </MobileText>
        <MobileRating value={clamp(average, 0, 5)} readOnly size={16} />
        <MobileText variant="caption" color="muted" tabular>
          {safeTotal} ratings
        </MobileText>
      </View>

      <View style={styles.rows}>
        {Array.from({ length: ROWS }, (_, i) => {
          const stars = ROWS - i
          const count = breakdown[i] ?? 0
          const fraction = safeTotal > 0 ? clamp(count / safeTotal, 0, 1) : 0
          return (
            <View key={stars} style={styles.row}>
              <MobileText
                variant="caption"
                color="muted"
                tabular
                style={styles.rowLabel}
              >
                {`${stars}★`}
              </MobileText>
              <MobileProgress
                value={fraction}
                color="warning"
                height={6}
                style={styles.rowBar}
              />
            </View>
          )
        })}
      </View>
    </MobileCard>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 20,
  },
  averageColumn: {
    alignItems: "center",
    gap: 4,
  },
  average: {
    fontWeight: "700",
  },
  rows: {
    flex: 1,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowLabel: {
    width: 24,
    textAlign: "right",
  },
  rowBar: {
    flex: 1,
  },
})
