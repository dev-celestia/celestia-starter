import * as React from "react"
import {
  Animated,
  View,
  StyleSheet,
  type ImageSourcePropType,
  type ImageStyle,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { canUseNativeDriver } from "../../motion"
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
  style?: ViewStyle & ImageStyle
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
  // Fades the image in once it resolves, so a slow network never paints a
  // blank circle that abruptly becomes a face. `onLoadEnd` (not `onLoad`)
  // fires on error too, so a broken source can't strand the avatar invisible.
  const imageOpacity = React.useRef(new Animated.Value(0)).current

  const boxStyle = {
    width: diameter,
    height: diameter,
    borderRadius: diameter / 2,
  }

  if (source) {
    return (
      <Animated.Image
        source={source}
        onLoadEnd={() => {
          Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: canUseNativeDriver,
          }).start()
        }}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel ?? trimmed}
        style={[
          boxStyle,
          { borderColor: colors.cardBorder, borderWidth: 1, opacity: imageOpacity },
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
