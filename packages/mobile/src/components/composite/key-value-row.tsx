import * as React from "react"
import {
  Pressable,
  View,
  StyleSheet,
  Animated,
  type ViewStyle,
} from "react-native"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"
import { hapticLight, isTextChildren } from "../../utils"
import { usePressSpring } from "../../motion"

export interface MobileKeyValueRowProps {
  /**
   * Key, muted, left-aligned.
   */
  label: string
  /**
   * Value slot, foreground, right-aligned. Any node — text, a badge, a
   * switch — so it can carry interactive or rich content.
   */
  value: React.ReactNode
  /**
   * Makes the row pressable and adds the › chevron. Omit for a read-only row:
   * a chevron on a dead row promises navigation that cannot happen.
   */
  onPress?: () => void
  /**
   * @default false
   */
  disabled?: boolean
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
 * MobileKeyValueRow
 *
 * Settings-style pair: muted label left, foreground value right, chevron when
 * pressable.
 *
 * The `MobileSettingRow` sibling takes a string `value`; this row takes a
 * node, so values can be badges, avatars or any composed content. The whole
 * row is the touch target at the 44pt floor with the house press-scale.
 */
export function MobileKeyValueRow({
  label,
  value,
  onPress,
  disabled = false,
  style,
  testID,
}: MobileKeyValueRowProps) {
  // Press feedback (dip + spring back). The Pressable's `disabled` prop
  // already gates press events, so the shared hook needs no local guards.
  const {
    value: pressAnim,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
  } = usePressSpring(1, 0.985)

  const handlePress = () => {
    if (disabled || !onPress) return
    hapticLight()
    onPress()
  }

  const content = (
    <>
      <MobileText
        variant="body"
        color="muted"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.label}
      >
        {label}
      </MobileText>
      <View style={styles.value}>
        {isTextChildren(value) ? (
          <MobileText variant="bodyMedium">{value}</MobileText>
        ) : (
          value
        )}
      </View>
      {onPress ? (
        <MobileText variant="bodyMedium" color="muted" style={styles.chevron}>
          ›
        </MobileText>
      ) : null}
    </>
  )

  if (!onPress) {
    return (
      <View
        testID={testID}
        style={[styles.row, { opacity: disabled ? 0.5 : 1 }, style]}
      >
        {content}
      </View>
    )
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[
        styles.row,
        {
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressAnim }],
        },
        style,
      ]}
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
    paddingVertical: 10,
    gap: 12,
  },
  label: {
    flex: 1,
    flexShrink: 1,
  },
  value: {
    flexShrink: 0,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  chevron: {
    fontWeight: "600",
  },
})
