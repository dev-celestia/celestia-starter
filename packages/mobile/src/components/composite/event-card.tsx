import * as React from "react"
import { StyleSheet, View } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { MobileCard } from "../primitive/card"
import { MobilePressableScale } from "../primitive/pressable-scale"
import { metrics } from "../../tokens"

export interface MobileEventCardProps {
  /**
   * Event name.
   */
  title: string
  /**
   * Date, either parseable by `Date` ("2026-09-30") or a pre-formatted
   * string. Parsed dates render as a day/month block; anything else renders
   * verbatim.
   */
  date: string
  /**
   * Optional time line, prefixed with a clock glyph.
   */
  time?: string
  /**
   * Optional location line, prefixed with a pin glyph.
   */
  location?: string
  /**
   * Makes the whole card pressable. Omit for a purely informational card.
   */
  onPress?: () => void
}

/** Month abbreviations indexed by `Date#getMonth`. Hermes' locale
 *  formatting is unreliable across platforms, so the table is explicit. */
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

/**
 * MobileEventCard
 *
 * Date block (big tabular day + month caption) beside the title, with
 * optional time/location glyph rows. The date block is the scan anchor —
 * in an event list the eye goes to "when" before "what".
 */
export function MobileEventCard({
  title,
  date,
  time,
  location,
  onPress,
}: MobileEventCardProps) {
  const { colors } = useMobileTheme()

  const parsed = new Date(date)
  const isValidDate = !Number.isNaN(parsed.getTime())

  const card = (
    <MobileCard style={styles.card}>
      <View
        style={[styles.dateBlock, { backgroundColor: colors.mutedBackground }]}
        accessibilityLabel={isValidDate ? `${MONTHS[parsed.getMonth()]} ${parsed.getDate()}` : date}
      >
        {isValidDate ? (
          <>
            <MobileText variant="heading" tabular style={styles.day}>
              {String(parsed.getDate())}
            </MobileText>
            <MobileText variant="label" color="muted">
              {MONTHS[parsed.getMonth()]?.toUpperCase()}
            </MobileText>
          </>
        ) : (
          // Unparseable input is still a date to the caller — show it as-is
          // rather than silently printing "NaN".
          <MobileText variant="caption" color="muted" align="center">
            {date}
          </MobileText>
        )}
      </View>

      <View style={styles.body}>
        <MobileText variant="title" numberOfLines={2}>
          {title}
        </MobileText>
        {time ? (
          <MobileText variant="callout" color="muted" style={styles.metaRow}>
            {`🕐 ${time}`}
          </MobileText>
        ) : null}
        {location ? (
          <MobileText
            variant="callout"
            color="muted"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.metaRow}
          >
            {`📍 ${location}`}
          </MobileText>
        ) : null}
      </View>
    </MobileCard>
  )

  if (!onPress) return card

  return <MobilePressableScale onPress={onPress}>{card}</MobilePressableScale>
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "stretch",
    padding: 14,
    gap: 14,
  },
  dateBlock: {
    width: 56,
    borderRadius: metrics.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 2,
  },
  day: {
    fontWeight: "700",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  metaRow: {
    marginTop: 2,
  },
})
