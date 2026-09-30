import * as React from "react"
import { Pressable, View, StyleSheet, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"
import { hitSlopFor, hapticLight } from "../../utils"

export interface MobileAttachmentChipProps {
  /**
   * Attachment name, truncated to one line.
   */
  label: string
  /**
   * Renders the trailing ✕ remove affordance. Omit for a read-only chip.
   */
  onDismiss?: () => void
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
 * MobileAttachmentChip
 *
 * Compact pill naming a pending attachment, with an optional ✕.
 *
 * No 📎 glyph: the chip only ever appears in attachment contexts (above a
 * composer, under an upload), where the icon restates what position already
 * says — and an emoji renders differently on every platform. The label
 * truncates with a max width so one long filename cannot push the dismiss
 * target off-screen.
 */
export function MobileAttachmentChip({
  label,
  onDismiss,
  style,
  testID,
}: MobileAttachmentChipProps) {
  const { colors } = useMobileTheme()

  return (
    <View
      testID={testID}
      accessibilityLabel={`Attachment ${label}`}
      style={[
        styles.chip,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
          borderRadius: metrics.radius.full,
        },
        style,
      ]}
    >
      <MobileText
        variant="callout"
        numberOfLines={1}
        ellipsizeMode="middle"
        style={styles.label}
      >
        {label}
      </MobileText>

      {onDismiss ? (
        <Pressable
          onPress={() => {
            hapticLight()
            onDismiss()
          }}
          accessibilityRole="button"
          accessibilityLabel={`Remove attachment ${label}`}
          // The visible chip is 32pt; slop lifts the ✕ to the 44pt floor.
          hitSlop={hitSlopFor(32)}
          style={styles.dismiss}
        >
          <MobileText variant="caption" color="muted" style={styles.dismissGlyph}>
            ✕
          </MobileText>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    height: 32,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 4,
    gap: 4,
  },
  label: {
    maxWidth: 160,
    flexShrink: 1,
  },
  dismiss: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissGlyph: {
    fontWeight: "600",
  },
})
