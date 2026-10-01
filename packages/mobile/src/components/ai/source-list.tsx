import * as React from "react"
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight } from "../../utils"
import { MobileText } from "../primitive/text"

export interface MobileAiSource {
  /** Stable key for the list. */
  id: string
  /** Source title, e.g. "Attention Is All You Need". */
  title: string
  /** Bare domain shown under the title, e.g. "arxiv.org". */
  domain?: string
  /** Full URL, handed back on selection. */
  url?: string
  /** Optional snippet preview. */
  snippet?: string
}

export interface MobileSourceListProps {
  /**
   * Cited sources, in citation order — item 0 is `[1]`.
   */
  sources: MobileAiSource[]
  /**
   * Section heading.
   * @default 'Sources'
   */
  title?: string
  /**
   * Fires with the tapped source. Omit to render the rows as static text.
   */
  onSelect?: (source: MobileAiSource) => void
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
 * MobileSourceList
 *
 * The bibliography under an answer: one row per citation, numbered to match the
 * inline `MobileCitationChip`s.
 *
 * The number is a *visible badge*, not just a list marker, because it is the
 * join key between the prose and this list — the reader scans for the "3" they
 * just saw in the paragraph. Rows render as plain `View`s when there is no
 * `onSelect`, so a non-interactive bibliography never presents itself as a
 * button.
 */
export function MobileSourceList({
  sources,
  title = "Sources",
  onSelect,
  style,
  testID,
}: MobileSourceListProps) {
  const { colors } = useMobileTheme()

  if (sources.length === 0) return null

  return (
    <View
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
          borderRadius: metrics.radius.md,
        },
        style,
      ]}
    >
      <View style={styles.header}>
        <MobileText variant="label" color="muted" style={styles.headerLabel}>
          {`${title.toUpperCase()} · ${sources.length}`}
        </MobileText>
      </View>

      {sources.map((source, index) => {
        const row = (
          <>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.mutedBackground,
                  borderRadius: metrics.radius.sm,
                },
              ]}
            >
              <MobileText variant="label" color="muted" tabular>
                {String(index + 1)}
              </MobileText>
            </View>

            <View style={styles.text}>
              <MobileText variant="callout" numberOfLines={2}>
                {source.title}
              </MobileText>
              {source.domain ? (
                <MobileText variant="caption" color="muted" numberOfLines={1}>
                  {source.domain}
                </MobileText>
              ) : null}
              {source.snippet ? (
                <MobileText
                  variant="caption"
                  color="muted"
                  numberOfLines={2}
                  style={styles.snippet}
                >
                  {source.snippet}
                </MobileText>
              ) : null}
            </View>
          </>
        )

        const rowStyle = [
          styles.row,
          index > 0
            ? {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              }
            : null,
        ]

        if (!onSelect) {
          return (
            <View key={source.id} style={rowStyle}>
              {row}
            </View>
          )
        }

        return (
          <Pressable
            key={source.id}
            onPress={() => {
              hapticLight()
              onSelect(source)
            }}
            accessibilityRole="link"
            accessibilityLabel={`Source ${index + 1}: ${source.title}${source.domain ? `, ${source.domain}` : ""}`}
            style={rowStyle}
          >
            {row}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  headerLabel: {
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: metrics.minTouchTarget,
  },
  badge: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: 1,
  },
  snippet: {
    marginTop: 2,
  },
})
