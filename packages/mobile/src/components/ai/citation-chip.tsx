import * as React from "react"
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight, hitSlopFor } from "../../utils"
import { MobileText } from "../primitive/text"

export interface MobileCitationChipProps {
  /**
   * Source number, 1-based. Rendered inside the chip and matching the index in
   * the `MobileSourceList` it belongs to.
   */
  index: number
  /**
   * Optional domain or short label appended after the number, e.g. "arxiv.org".
   */
  label?: string
  /**
   * Marks the chip as the currently-previewed source.
   * @default false
   */
  active?: boolean
  /**
   * Fires when the chip is tapped. Omit to render a static, non-interactive
   * marker.
   */
  onPress?: () => void
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const CHIP_HEIGHT = 24

/**
 * MobileCitationChip
 *
 * The inline `[3]` marker that anchors a claim in the answer to a numbered
 * source in `MobileSourceList`.
 *
 * It is a *marker first, control second*: the number is the payload, so the chip
 * stays legible at 11pt and only grows a label when one is supplied. The
 * interactive box is 24pt with vertical `hitSlop` up to the 44pt floor —
 * horizontal slop is deliberately omitted because citations sit shoulder to
 * shoulder in a run of prose and their touch areas would overlap.
 */
export function MobileCitationChip({
  index,
  label,
  active = false,
  onPress,
  style,
  testID,
}: MobileCitationChipProps) {
  const { colors } = useMobileTheme()
  const slop = hitSlopFor(CHIP_HEIGHT)

  const content = (
    <View
      style={[
        styles.chip,
        {
          minHeight: CHIP_HEIGHT,
          borderRadius: metrics.radius.full,
          borderColor: active ? colors.primary : colors.inputBorder,
          backgroundColor: active ? colors.primary : colors.secondary,
        },
        style,
      ]}
    >
      <MobileText
        variant="label"
        tabular
        style={{ color: active ? colors.primaryForeground : colors.foreground }}
      >
        {String(index)}
      </MobileText>
      {label ? (
        <MobileText
          variant="caption"
          numberOfLines={1}
          style={{
            color: active ? colors.primaryForeground : colors.muted,
            maxWidth: 120,
          }}
        >
          {label}
        </MobileText>
      ) : null}
    </View>
  )

  if (!onPress) {
    return (
      <View testID={testID} style={styles.wrapper}>
        {content}
      </View>
    )
  }

  return (
    <Pressable
      onPress={() => {
        hapticLight()
        onPress()
      }}
      testID={testID}
      accessibilityRole="link"
      accessibilityLabel={
        label ? `Source ${index}, ${label}` : `Source ${index}`
      }
      accessibilityState={{ selected: active }}
      hitSlop={{ top: slop, bottom: slop }}
      style={styles.wrapper}
    >
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-start",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
})
