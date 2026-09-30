import * as React from "react"
import {
  Pressable,
  View,
  StyleSheet,
  Animated,
  type ViewStyle,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { usePressSpring } from "../../motion"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface MobileSettingRowProps {
  /**
   * Row label.
   */
  label: string
  /**
   * Optional secondary line beneath the label.
   */
  description?: string
  /**
   * Right-aligned value text, clamped to one line. Use this for read-only
   * values (a language name, a theme); use `trailing` for an interactive
   * control.
   */
  value?: string
  /**
   * Left slot, typically an icon.
   */
  leading?: React.ReactNode
  /**
   * Right slot, typically a `MobileSwitch` or `MobileBadge`.
   */
  trailing?: React.ReactNode
  /**
   * Makes the row pressable. Omit for a purely informational row — it will
   * render as a plain View rather than a button with no action.
   */
  onPress?: () => void
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * Shows a trailing chevron. Only rendered when `onPress` is set, since a
   * chevron on a non-interactive row promises navigation that cannot happen.
   * @default true
   */
  showChevron?: boolean
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
 * MobileSettingRow
 *
 * One settings line: optional icon, label + description, optional value text,
 * optional trailing control, optional chevron.
 *
 * The whole row is the touch target at the 44pt floor, which is what makes a
 * settings list usable one-handed. Trailing controls (a switch, a badge) sit
 * inside the row but keep their own semantics.
 */
export function MobileSettingRow({
  label,
  description,
  value,
  leading,
  trailing,
  onPress,
  disabled = false,
  showChevron = true,
  style,
  testID,
}: MobileSettingRowProps) {
  const { colors } = useMobileTheme()
  // Subtle shrink on press, springing back on release — the row is one large
  // touch target, so a small scale reads better than a highlight flash. The
  // old handlers' disabled guards were redundant: a disabled Pressable never
  // fires press events, so the hook alone covers the disabled case.
  const { value: pressAnim, onPressIn, onPressOut } = usePressSpring(1, 0.985)

  const handlePress = () => {
    if (disabled || !onPress) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    onPress()
  }

  const content = (
    <>
      {leading ? <View style={styles.leading}>{leading}</View> : null}

      <View style={styles.text}>
        <MobileText variant="body">{label}</MobileText>
        {description ? (
          <MobileText
            variant="caption"
            color="muted"
            style={styles.description}
          >
            {description}
          </MobileText>
        ) : null}
      </View>

      {value ? (
        <MobileText
          variant="callout"
          color="muted"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={styles.value}
        >
          {value}
        </MobileText>
      ) : null}

      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}

      {onPress && showChevron ? (
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
        style={[styles.row, { opacity: disabled ? 0.45 : 1 }, style]}
      >
        {content}
      </View>
    )
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[
        styles.row,
        {
          opacity: disabled ? 0.45 : 1,
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
  leading: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
  value: {
    flexShrink: 1,
    textAlign: "right",
  },
  trailing: {
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    fontWeight: "600",
  },
})
