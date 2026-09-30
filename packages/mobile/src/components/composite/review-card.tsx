import * as React from "react"
import { StyleSheet, View } from "react-native"
import { MobileText } from "../primitive/text"
import { MobileCard } from "../primitive/card"
import { MobileRating } from "../primitive/rating"

export interface MobileReviewCardProps {
  /**
   * Reviewer display name.
   */
  author: string
  /**
   * Star value, read-only — a review card reports a verdict, it does not
   * collect one.
   */
  rating: number
  /**
   * Optional timestamp string, rendered muted on the author row.
   */
  time?: string
  /**
   * Review body.
   */
  text: string
}

/**
 * MobileReviewCard
 *
 * Read-only stars + author row + text. The rating is deliberately
 * non-interactive so assistive tech announces it as a value, not a control.
 */
export function MobileReviewCard({
  author,
  rating,
  time,
  text,
}: MobileReviewCardProps) {
  return (
    <MobileCard style={styles.card}>
      <View style={styles.header}>
        <MobileText
          variant="callout"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.author}
        >
          {author}
        </MobileText>
        {time ? (
          <MobileText variant="caption" color="muted" numberOfLines={1}>
            {time}
          </MobileText>
        ) : null}
      </View>

      <MobileRating value={rating} readOnly size={16} />

      <MobileText variant="body">{text}</MobileText>
    </MobileCard>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  author: {
    fontWeight: "600",
    flexShrink: 1,
  },
})
