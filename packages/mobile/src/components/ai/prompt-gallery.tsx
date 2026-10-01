import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight } from "../../utils"
import { MobileText } from "../primitive/text"
import { MobilePressableScale } from "../primitive/pressable-scale"

export interface MobileAiPrompt {
  /** Stable key, passed back on selection. */
  id: string
  /** Prompt headline, e.g. "Summarise a document". */
  title: string
  /** One-line explanation of what the prompt does. */
  description?: string
  /** Leading icon slot. */
  icon?: React.ReactNode
  /** Small trailing label, e.g. "Popular". */
  badge?: string
}

export interface MobilePromptGalleryProps {
  /**
   * Starter prompts, in display order.
   */
  prompts: MobileAiPrompt[]
  /**
   * Fires with the chosen prompt.
   */
  onSelect: (prompt: MobileAiPrompt) => void
  /**
   * Optional heading.
   * @default 'Start with'
   */
  title?: string
  /**
   * Grid columns. `1` is a stack of wide rows, `2` a compact card grid.
   * @default 1
   */
  columns?: 1 | 2
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
 * MobilePromptGallery
 *
 * The starter-prompt grid on a fresh conversation — the "what can this thing
 * do" surface.
 *
 * A card carries **both** a title and a description, and the title alone is
 * never the whole card: "Summarise" tells a new user nothing, "Summarise a
 * document — paste a link or attach a PDF" tells them what to do next. In
 * `columns={2}` the description is dropped, since a half-width card has no room
 * for a second line at a readable size; the trade is deliberate and documented
 * rather than left to truncation.
 *
 * Rows are laid out with explicit width fractions instead of `flexWrap`, so the
 * last row of an odd-length grid keeps its card width instead of stretching to
 * fill the row.
 */
export function MobilePromptGallery({
  prompts,
  onSelect,
  title = "Start with",
  columns = 1,
  style,
  testID,
}: MobilePromptGalleryProps) {
  const { colors } = useMobileTheme()

  if (prompts.length === 0) return null

  const isTwoUp = columns === 2

  return (
    <View testID={testID} style={[styles.container, style]}>
      {title ? (
        <MobileText variant="label" color="muted" style={styles.title}>
          {title}
        </MobileText>
      ) : null}

      <View style={styles.grid}>
        {prompts.map((prompt) => (
          <MobilePressableScale
            key={prompt.id}
            onPress={() => {
              hapticLight()
              onSelect(prompt)
            }}
            accessibilityLabel={`${prompt.title}${prompt.description ? `, ${prompt.description}` : ""}`}
            containerStyle={isTwoUp ? styles.halfCell : styles.fullCell}
            style={{
              ...styles.card,
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderRadius: metrics.radius.md,
            }}
          >
            <View style={styles.cardHeader}>
              {prompt.icon ? (
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: colors.mutedBackground,
                      borderRadius: metrics.radius.sm,
                    },
                  ]}
                >
                  {prompt.icon}
                </View>
              ) : null}

              <View style={styles.cardText}>
                <MobileText
                  variant="callout"
                  numberOfLines={isTwoUp ? 2 : 1}
                  style={styles.cardTitle}
                >
                  {prompt.title}
                </MobileText>
                {!isTwoUp && prompt.description ? (
                  <MobileText variant="caption" color="muted" numberOfLines={2}>
                    {prompt.description}
                  </MobileText>
                ) : null}
              </View>

              {prompt.badge ? (
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: colors.mutedBackground,
                      borderRadius: metrics.radius.full,
                    },
                  ]}
                >
                  <MobileText variant="label" color="muted">
                    {prompt.badge}
                  </MobileText>
                </View>
              ) : null}
            </View>
          </MobilePressableScale>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  title: {
    letterSpacing: 0.6,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  // `flexGrow: 0` keeps an odd final card at half width instead of stretching.
  halfCell: {
    flexGrow: 0,
    flexBasis: "48%",
  },
  fullCell: {
    flexGrow: 0,
    flexBasis: "100%",
  },
  card: {
    width: "100%",
    borderWidth: 1,
    padding: 12,
    minHeight: metrics.minTouchTarget,
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
})
