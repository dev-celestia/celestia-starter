import * as React from "react"
import {
  Pressable,
  View,
  StyleSheet,
  Animated,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { usePressSpring } from "../../motion"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"
import { hitSlopFor, hapticLight } from "../../utils"

export interface MobileFileRowProps {
  /**
   * File name, truncated to one line (middle-of-name is what matters least,
   * so tail ellipsis keeps the extension visible).
   */
  name: string
  /**
   * Pre-formatted size caption, e.g. "2.4 MB".
   */
  size?: string
  /**
   * Leading icon slot (file-type mark), rendered inside a muted box.
   */
  icon?: React.ReactNode
  /**
   * Makes the row pressable (open/preview). Omit for a purely informational row.
   */
  onPress?: () => void
  /**
   * Renders the trailing ✕ remove affordance.
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * MobileFileRow
 *
 * File list line: icon box, truncated name, size caption, optional ✕.
 *
 * Remove is its own touch target lifted to 44pt with hitSlop so it never
 * overlaps the row press ambiguously — hitting the ✕ must never open the file
 * instead. Both actions commit with a light haptic.
 */
export function MobileFileRow({
  name,
  size,
  icon,
  onPress,
  onDismiss,
  style,
  testID,
}: MobileFileRowProps) {
  const { colors } = useMobileTheme()
  const {
    value: pressAnim,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
  } = usePressSpring(1, 0.985)

  const content = (
    <>
      {icon ? (
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: colors.mutedBackground,
              borderRadius: metrics.radius.md,
            },
          ]}
        >
          {icon}
        </View>
      ) : null}

      <View style={styles.text}>
        <MobileText variant="bodyMedium" numberOfLines={1} ellipsizeMode="tail">
          {name}
        </MobileText>
        {size ? (
          <MobileText variant="caption" color="muted" tabular numberOfLines={1}>
            {size}
          </MobileText>
        ) : null}
      </View>

      {onDismiss ? (
        <Pressable
          onPress={() => {
            hapticLight()
            onDismiss()
          }}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${name}`}
          hitSlop={hitSlopFor(24)}
          style={styles.dismiss}
        >
          <MobileText variant="caption" color="muted" style={styles.dismissGlyph}>
            ✕
          </MobileText>
        </Pressable>
      ) : null}
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

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${name}${size ? `, ${size}` : ""}`}
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
  iconBox: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  dismiss: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissGlyph: {
    fontWeight: "600",
  },
})
