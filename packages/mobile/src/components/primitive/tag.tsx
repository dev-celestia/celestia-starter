import * as React from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics, type ColorRamp } from "../../tokens"
import { hapticLight } from "../../utils"
import { MobileText } from "./text"

export type MobileTagTone =
  | "muted"
  | "primary"
  | "success"
  | "warning"
  | "destructive"
  | "info"

export interface MobileTagProps {
  /**
   * Tag caption. Kept short by design — a tag is a glance, not a sentence.
   */
  label: string
  /**
   * Semantic tone mapping to the theme ramp.
   * @default 'muted'
   */
  tone?: MobileTagTone
  /**
   * When provided, renders an ✕ affordance that fires this callback.
   */
  onDismiss?: () => void
}

/** Resolves a tone to its fill/foreground pair from the live ramp. */
function tonePair(
  colors: ColorRamp,
  tone: MobileTagTone
): { bg: string; fg: string } {
  switch (tone) {
    case "primary":
      return { bg: colors.primary, fg: colors.primaryForeground }
    case "success":
      return { bg: colors.success, fg: colors.successForeground }
    case "warning":
      return { bg: colors.warning, fg: colors.warningForeground }
    case "destructive":
      return { bg: colors.destructive, fg: colors.destructiveForeground }
    case "info":
      return { bg: colors.info, fg: colors.infoForeground }
    case "muted":
    default:
      // Muted inverts the usual pairing: neutral fill, muted ink — a tag that
      // recedes rather than signalling a status.
      return { bg: colors.mutedBackground, fg: colors.muted }
  }
}

/**
 * MobileTag
 *
 * Small static tone chip for categorisation — metadata, keywords, filter
 * readouts. Unlike `MobileChip` it is never selectable; the only interaction
 * is the optional dismiss, which fires a light haptic on commit.
 *
 * The dismiss glyph is a text mark (✕) rather than an icon component, so the
 * tag carries no icon dependency.
 */
export function MobileTag({ label, tone = "muted", onDismiss }: MobileTagProps) {
  const { colors } = useMobileTheme()
  const { bg, fg } = tonePair(colors, tone)

  return (
    <View
      style={[
        styles.tag,
        { backgroundColor: bg, borderRadius: metrics.radius.sm },
      ]}
    >
      <MobileText variant="label" style={{ color: fg }}>
        {label}
      </MobileText>

      {onDismiss ? (
        <Pressable
          onPress={() => {
            hapticLight()
            onDismiss()
          }}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          // The glyph is tiny; the slop is what makes it a touch target.
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          style={styles.dismiss}
        >
          <MobileText variant="caption" style={{ color: fg, fontWeight: "600" }}>
            ✕
          </MobileText>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  dismiss: {
    alignItems: "center",
    justifyContent: "center",
  },
})
