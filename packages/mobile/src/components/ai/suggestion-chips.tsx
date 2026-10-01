import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { MobileText } from "../primitive/text"
import { MobileChip } from "../primitive/chip"

export interface MobileSuggestionChipsProps {
  /**
   * Suggested prompts. Order is display order.
   */
  suggestions: string[]
  /**
   * Fires with the chosen suggestion.
   */
  onSelect: (suggestion: string) => void
  /**
   * Optional caption above the row, e.g. "Try one of these".
   */
  title?: string
  /**
   * Caps how many chips are rendered. Extra suggestions are dropped rather
   * than scrolled — a suggestion is a nudge, and a long list stops nudging.
   */
  max?: number
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
 * MobileSuggestionChips
 *
 * The row of starter prompts under an empty conversation.
 *
 * It **wraps instead of scrolling**. A horizontally-scrolling suggestion row
 * hides half its options off-screen, and an empty-state nudge whose second half
 * is invisible is not a nudge. Wrapping also keeps every chip reachable with a
 * thumb on a tall phone, where a scroll row would sit at the very bottom edge.
 *
 * Each chip is a `MobileChip`, so selection semantics, the press spring and the
 * 44pt touch floor all come from the primitive rather than being re-derived.
 */
export function MobileSuggestionChips({
  suggestions,
  onSelect,
  title,
  max,
  style,
  testID,
}: MobileSuggestionChipsProps) {
  const visible =
    max != null ? suggestions.slice(0, Math.max(0, max)) : suggestions

  if (visible.length === 0) return null

  return (
    <View testID={testID} style={[styles.container, style]}>
      {title ? (
        <MobileText variant="label" color="muted" style={styles.title}>
          {title}
        </MobileText>
      ) : null}

      <View style={styles.row}>
        {visible.map((suggestion, index) => (
          <MobileChip
            key={`${index}-${suggestion}`}
            label={suggestion}
            onPress={() => onSelect(suggestion)}
          />
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
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
})
