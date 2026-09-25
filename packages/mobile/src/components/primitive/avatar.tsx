import * as React from "react"
import {
  Image,
  View,
  StyleSheet,
  type ImageSourcePropType,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "./text"
import type { MobileTextVariant } from "./text"

export type MobileAvatarSize = "sm" | "md" | "lg" | "xl"

/**
 * Diameter in points per size. Exported so composites (`MobileAvatarGroup`) can
 * compute overlap from the same numbers the avatar itself uses, rather than
 * duplicating the scale and drifting from it.
 */
export const mobileAvatarSizes: Record<MobileAvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
}

const INITIALS_VARIANT: Record<MobileAvatarSize, MobileTextVariant> = {
  sm: "caption",
  md: "callout",
  lg: "bodyMedium",
  xl: "title",
}

export interface MobileAvatarProps {
  /**
   * Image source. Takes precedence over `initials` and `fallback`.
   */
  source?: ImageSourcePropType
  /**
   * One or two characters shown when there is no image. Extra characters are
   * trimmed and the result is upper-cased.
   */
  initials?: string
  /**
   * Custom fallback node, used when there is neither an image nor initials.
   */
  fallback?: React.ReactNode
  /**
   * Avatar diameter.
   * @default 'md'
   */
  size?: MobileAvatarSize
  /**
   * Screen-reader description. Falls back to `initials` when omitted.
   */
  accessibilityLabel?: string
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

/**
 * MobileAvatar
 *
 * Circular identity mark with three tiers of fallback: image, then initials,
 * then an arbitrary node. Sizing is driven by a single map so the diameter and
 * the initials type-scale can never drift apart.
 */
export function MobileAvatar({
  source,
  initials,
  fallback,
  size = "md",
  accessibilityLabel,
  style,
}: MobileAvatarProps) {
  const { colors } = useMobileTheme()
  const diameter = mobileAvatarSizes[size]
  const trimmed = initials?.trim().slice(0, 2).toUpperCase()

  const boxStyle = {
    width: diameter,
    height: diameter,
    borderRadius: diameter / 2,
  }

  if (source) {
    return (
      <Image
        source={source}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel ?? trimmed}
        style={[
          boxStyle,
          { borderColor: colors.cardBorder, borderWidth: 1 },
          style,
        ]}
      />
    )
  }

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? trimmed}
      style={[styles.container, boxStyle, { backgroundColor: colors.mutedBackground }, style]}
    >
      {fallback ?? (
        <MobileText
          variant={INITIALS_VARIANT[size]}
          color="muted"
          style={styles.initials}
        >
          {trimmed ?? "?"}
        </MobileText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: {
    fontWeight: "600",
  },
})
