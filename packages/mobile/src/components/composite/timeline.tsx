import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { MobileStatusDot } from "../primitive/status-dot"

export type MobileTimelineTone =
  | "muted"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"

export interface MobileTimelineItem {
  /**
   * Entry headline.
   */
  title: string
  /**
   * Optional secondary line under the title.
   */
  subtitle?: string
  /**
   * Optional timestamp, rendered muted and tabular.
   */
  time?: string
  /**
   * Dot colour.
   * @default 'muted'
   */
  tone?: MobileTimelineTone
}

export interface MobileTimelineProps {
  /**
   * Entries, oldest first.
   */
  items: MobileTimelineItem[]
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

const DOT = 10

/**
 * MobileTimeline
 *
 * Vertical rail of tone-coloured dots joined by a connector line, each with
 * title/time/subtitle. `primary` is drawn inline because `MobileStatusDot`
 * covers status semantics only — a brand-coloured milestone is not a status.
 * The connector stops at the last dot so the rail never dangles.
 */
export function MobileTimeline({ items, style }: MobileTimelineProps) {
  const { colors } = useMobileTheme()

  return (
    <View style={[styles.container, style]} accessibilityRole="list">
      {items.map((item, index) => {
        const tone = item.tone ?? "muted"
        const isLast = index === items.length - 1

        return (
          <View key={`${item.title}-${index}`} style={styles.item}>
            <View style={styles.rail}>
              <View style={styles.dotSlot}>
                {tone === "primary" ? (
                  <View
                    style={[
                      styles.primaryDot,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                  />
                ) : (
                  <MobileStatusDot tone={tone} size={DOT} />
                )}
              </View>
              {isLast ? null : (
                <View style={[styles.line, { backgroundColor: colors.border }]} />
              )}
            </View>

            <View style={[styles.content, isLast ? undefined : styles.contentGap]}>
              <MobileText variant="bodyMedium">{item.title}</MobileText>
              {item.time ? (
                <MobileText variant="caption" color="muted" tabular>
                  {item.time}
                </MobileText>
              ) : null}
              {item.subtitle ? (
                <MobileText variant="callout" color="muted">
                  {item.subtitle}
                </MobileText>
              ) : null}
            </View>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  item: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  rail: {
    width: DOT + 8,
    alignItems: "center",
  },
  // Fixed-height slot so the dot's vertical centre lines up with the title's
  // first line regardless of tone rendering differences.
  dotSlot: {
    height: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryDot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 1,
  },
  line: {
    flex: 1,
    width: 2,
    borderRadius: 1,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    gap: 2,
    paddingBottom: 4,
  },
  contentGap: {
    paddingBottom: 16,
  },
})
