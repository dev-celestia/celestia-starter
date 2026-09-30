import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { MobileText } from "../primitive/text"
import { MobileCard } from "../primitive/card"
import { MobileProgress } from "../primitive/progress"
import { clamp } from "../../utils"

export interface MobileProgressCardProps {
  /**
   * Card headline, e.g. "Profile strength".
   */
  title: string
  /**
   * Completion in the range 0–1, matching `MobileProgress`. Clamped.
   */
  value: number
  /**
   * Optional muted hint under the bar, e.g. "2 steps left".
   */
  caption?: string
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

/**
 * MobileProgressCard
 *
 * Title + big tabular percent + bar + muted caption. The percent is tabular
 * so the number doesn't jiggle sideways as it animates; the bar springs on
 * its own inside `MobileProgress`.
 */
export function MobileProgressCard({
  title,
  value,
  caption,
  style,
}: MobileProgressCardProps) {
  const clamped = clamp(value, 0, 1)
  const percent = Math.round(clamped * 100)

  return (
    <MobileCard style={StyleSheet.flatten([styles.card, style])}>
      <View style={styles.headerRow}>
        <MobileText
          variant="callout"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.title}
        >
          {title}
        </MobileText>
        <MobileText variant="title" tabular style={styles.percent}>
          {`${percent}%`}
        </MobileText>
      </View>

      <MobileProgress value={clamped} />

      {caption ? (
        <MobileText variant="caption" color="muted">
          {caption}
        </MobileText>
      ) : null}
    </MobileCard>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flexShrink: 1,
    fontWeight: "600",
  },
  percent: {
    fontWeight: "700",
  },
})
