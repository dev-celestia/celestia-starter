import * as React from "react"
import {
  Pressable,
  View,
  StyleSheet,
  Animated,
  type ImageSourcePropType,
  type ViewStyle,
} from "react-native"
import { pressInTiming, springTo } from "../../motion"
import { MobileText } from "../primitive/text"
import { MobileAvatar } from "../primitive/avatar"
import { metrics } from "../../tokens"
import { getInitials, hapticLight } from "../../utils"

export interface MobileUserRowProps {
  /**
   * Display name.
   */
  name: string
  /**
   * Secondary line — handle, email, role.
   */
  subtitle?: string
  /**
   * Explicit initials for the avatar. Derived from `name` via `getInitials`
   * when omitted.
   */
  initials?: string
  /**
   * Avatar photo; wins over initials.
   */
  imageSource?: ImageSourcePropType
  /**
   * Right slot — a badge, a chevron, a follow button.
   */
  trailing?: React.ReactNode
  /**
   * Makes the row pressable. Omit for a purely informational row.
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * MobileUserRow
 *
 * Avatar + name/subtitle + trailing slot — the atom of every people list
 * (contacts, comments, members).
 *
 * Initials are derived from `name` when not given, so the common case needs
 * one prop. When pressable, the whole row is the touch target with the house
 * press-scale spring and a light haptic on commit.
 */
export function MobileUserRow({
  name,
  subtitle,
  initials,
  imageSource,
  trailing,
  onPress,
  style,
  testID,
}: MobileUserRowProps) {
  const pressAnim = React.useRef(new Animated.Value(1)).current
  const resolvedInitials = initials ?? (name ? getInitials(name) : undefined)

  const content = (
    <>
      <MobileAvatar
        source={imageSource}
        initials={resolvedInitials}
        size="md"
        accessibilityLabel={name}
      />
      <View style={styles.text}>
        <MobileText variant="bodyMedium" numberOfLines={1} ellipsizeMode="tail">
          {name}
        </MobileText>
        {subtitle ? (
          <MobileText
            variant="caption"
            color="muted"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </MobileText>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </>
  )

  if (!onPress) {
    return (
      <View testID={testID} style={[styles.row, style]}>
        {content}
      </View>
    )
  }

  const handlePress = () => {
    hapticLight()
    onPress()
  }

  const handlePressIn = () => {
    pressInTiming(pressAnim, 0.985).start()
  }

  const handlePressOut = () => {
    springTo(pressAnim, 1).start()
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={name}
      style={[styles.row, style, { transform: [{ scale: pressAnim }] }]}
    >
      {content}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: metrics.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  text: {
    flex: 1,
  },
  trailing: {
    alignItems: "center",
    justifyContent: "center",
  },
})
