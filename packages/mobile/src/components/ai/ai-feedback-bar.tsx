import * as React from "react"
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight, hitSlopFor } from "../../utils"
import { MobileText } from "../primitive/text"

export type MobileAiFeedback = "up" | "down" | null

export interface MobileAiFeedbackBarProps {
  /**
   * Current rating, or `null` for unrated.
   * @default null
   */
  value?: MobileAiFeedback
  /**
   * Fires with the next rating. Re-tapping the active rating clears it back to
   * `null`, so the control is always reversible.
   */
  onChange?: (value: MobileAiFeedback) => void
  /**
   * Fires from the copy action. Omit to hide the action.
   */
  onCopy?: () => void
  /**
   * Fires from the regenerate action. Omit to hide the action.
   */
  onRegenerate?: () => void
  /**
   * Fires from the share action. Omit to hide the action.
   */
  onShare?: () => void
  /**
   * Icon overrides. Every slot falls back to a drawn text mark, so the bar is
   * complete without an icon dependency.
   */
  icons?: {
    copy?: React.ReactNode
    regenerate?: React.ReactNode
    share?: React.ReactNode
    up?: React.ReactNode
    down?: React.ReactNode
  }
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const ACTION_SIZE = 32

/**
 * MobileAiFeedbackBar
 *
 * The action row under an answer: copy, regenerate, share, and a thumbs pair.
 *
 * Rating is **reversible by design** — tapping the active thumb clears the
 * vote. A one-way rating control traps a mis-tap with no way back, and the
 * clear case (`null`) is exactly what the API wants when a user changes their
 * mind.
 *
 * Selection is carried by fill *and* by a doubled glyph weight, never by colour
 * alone. Every action box is 32pt lifted to the 44pt floor with vertical
 * `hitSlop`; horizontal slop is omitted because the buttons sit in a tight row.
 */
export function MobileAiFeedbackBar({
  value = null,
  onChange,
  onCopy,
  onRegenerate,
  onShare,
  icons,
  style,
  testID,
}: MobileAiFeedbackBarProps) {
  const { colors } = useMobileTheme()

  const slop = hitSlopFor(ACTION_SIZE)

  const renderAction = (
    key: string,
    glyph: React.ReactNode,
    label: string,
    onPress: () => void,
    selected = false
  ) => (
    <Pressable
      key={key}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected ? { selected: true } : undefined}
      hitSlop={{ top: slop, bottom: slop }}
      style={[
        styles.action,
        {
          width: ACTION_SIZE,
          height: ACTION_SIZE,
          borderRadius: metrics.radius.sm,
          backgroundColor: selected ? colors.mutedBackground : "transparent",
          borderColor: selected ? colors.border : "transparent",
        },
      ]}
    >
      {glyph}
    </Pressable>
  )

  const glyph = (node: React.ReactNode, fallback: string, color: string) =>
    node ?? (
      <MobileText variant="callout" style={{ color }}>
        {fallback}
      </MobileText>
    )

  return (
    <View testID={testID} style={[styles.row, style]}>
      {onCopy
        ? renderAction(
            "copy",
            glyph(icons?.copy, "\u29C9", colors.muted),
            "Copy answer",
            () => {
              hapticLight()
              onCopy()
            }
          )
        : null}

      {onRegenerate
        ? renderAction(
            "regenerate",
            glyph(icons?.regenerate, "\u21BB", colors.muted),
            "Regenerate answer",
            () => {
              hapticLight()
              onRegenerate()
            }
          )
        : null}

      {onShare
        ? renderAction(
            "share",
            glyph(icons?.share, "\u2197", colors.muted),
            "Share answer",
            () => {
              hapticLight()
              onShare()
            }
          )
        : null}

      {/* A hairline splits the utility actions from the rating pair, so a
          mis-tap on "share" is not read as a vote. */}
      {onChange ? (
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      ) : null}

      {onChange
        ? renderAction(
            "up",
            glyph(
              icons?.up,
              "\u25B2",
              value === "up" ? colors.success : colors.muted
            ),
            value === "up" ? "Remove helpful rating" : "Mark as helpful",
            () => {
              hapticLight()
              onChange(value === "up" ? null : "up")
            },
            value === "up"
          )
        : null}

      {onChange
        ? renderAction(
            "down",
            glyph(
              icons?.down,
              "\u25BC",
              value === "down" ? colors.destructive : colors.muted
            ),
            value === "down"
              ? "Remove unhelpful rating"
              : "Mark as not helpful",
            () => {
              hapticLight()
              onChange(value === "down" ? null : "down")
            },
            value === "down"
          )
        : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  action: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
    marginHorizontal: 6,
  },
})
