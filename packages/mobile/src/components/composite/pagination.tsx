import * as React from "react"
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"
import { hapticSelect } from "../../utils"

export interface MobilePaginationProps {
  /**
   * Current page, 1-based.
   */
  page: number
  /**
   * Total number of pages.
   */
  pageCount: number
  /**
   * Called with the newly requested page. Never called with an
   * out-of-bounds value — the arrows disable at the edges instead.
   */
  onChange: (page: number) => void
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

/**
 * MobilePagination
 *
 * "‹ Page X of Y ›" — a page-position readout rather than numbered links.
 * Numbered pagination does not survive a phone's width; a position plus two
 * thumb-sized arrows does. Bounds disable the arrows (opacity 0.5) instead
 * of wrapping, because wrapping silently loses the user's place in a list.
 */
export function MobilePagination({
  page,
  pageCount,
  onChange,
  style,
}: MobilePaginationProps) {
  const { colors } = useMobileTheme()

  const atStart = page <= 1
  const atEnd = page >= pageCount

  const step = (delta: number) => {
    const next = page + delta
    if (next < 1 || next > pageCount) return
    hapticSelect()
    onChange(next)
  }

  const arrow = (
    glyph: string,
    label: string,
    disabled: boolean,
    delta: number
  ) => (
    <Pressable
      onPress={() => step(delta)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.arrow, { opacity: disabled ? 0.5 : 1 }]}
    >
      <MobileText variant="title" color={disabled ? "muted" : colors.primary}>
        {glyph}
      </MobileText>
    </Pressable>
  )

  return (
    <View style={[styles.row, style]}>
      {arrow("‹", "Previous page", atStart, -1)}
      <MobileText variant="callout" tabular style={styles.position}>
        {`Page ${page} of ${pageCount}`}
      </MobileText>
      {arrow("›", "Next page", atEnd, 1)}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  // The arrows are the touch targets; the 44pt floor is met by the box, not
  // by hitSlop, because there is nothing beside them to bleed into.
  arrow: {
    width: metrics.minTouchTarget,
    height: metrics.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  position: {
    flexShrink: 1,
    textAlign: "center",
  },
})
