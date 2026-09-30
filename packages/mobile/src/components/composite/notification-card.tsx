import * as React from "react"
import {
  Pressable,
  View,
  StyleSheet,
  Animated,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { MobileSurface } from "../primitive/surface"
import { MobileStatusDot } from "../primitive/status-dot"
import { metrics } from "../../tokens"
import { formatRelativeTime, hitSlopFor, hapticLight } from "../../utils"
import { pressInTiming, springTo } from "../../motion"

export interface MobileNotificationCardProps {
  /**
   * Notification headline.
   */
  title: string
  /**
   * Body copy, clamped to two lines.
   */
  body?: string
  /**
   * Timestamp. A Date-ish string (anything `new Date()` parses) is rendered
   * via `formatRelativeTime` ("5m ago"); any other string is shown verbatim,
   * so pre-formatted copy from the server passes through untouched.
   */
  time?: string
  /**
   * Leading icon slot.
   */
  icon?: React.ReactNode
  /**
   * Marks the card unread: a pulsing info dot.
   * @default false
   */
  unread?: boolean
  /**
   * Makes the card pressable. Omit for a purely informational card.
   */
  onPress?: () => void
  /**
   * Renders the trailing × dismiss affordance.
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
 * MobileNotificationCard
 *
 * Card row with icon, title/body, relative time, unread dot and dismiss ×.
 *
 * The unread mark is a dot, not a background tint: tinting the whole card
 * fights the theme in dark mode, while a dot stays one accent-coloured pixel
 * of meaning. The dot uses tone "info" (the status-dot contract has no
 * "primary" tone). Dismiss is its own touch target lifted to 44pt with
 * hitSlop, so it never competes with the card press.
 */
export function MobileNotificationCard({
  title,
  body,
  time,
  icon,
  unread = false,
  onPress,
  onDismiss,
  style,
  testID,
}: MobileNotificationCardProps) {
  const { colors } = useMobileTheme()
  const pressAnim = React.useRef(new Animated.Value(1)).current

  const displayTime = React.useMemo(() => {
    if (!time) return undefined
    const parsed = new Date(time)
    // Valid Date-ish string → relative; otherwise the string is already copy.
    return Number.isNaN(parsed.getTime()) ? time : formatRelativeTime(parsed)
  }, [time])

  const content = (
    <MobileSurface variant="card">
      <View style={styles.body}>
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
          <View style={styles.titleRow}>
            <MobileText
              variant="bodyMedium"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.title}
            >
              {title}
            </MobileText>
            {displayTime ? (
              <MobileText variant="caption" color="muted" tabular>
                {displayTime}
              </MobileText>
            ) : null}
          </View>
          {body ? (
            <MobileText variant="caption" color="muted" numberOfLines={2}>
              {body}
            </MobileText>
          ) : null}
        </View>

        {unread ? (
          <View style={styles.dot}>
            <MobileStatusDot tone="info" pulse />
          </View>
        ) : null}

        {onDismiss ? (
          <Pressable
            onPress={() => {
              hapticLight()
              onDismiss()
            }}
            accessibilityRole="button"
            accessibilityLabel={`Dismiss notification: ${title}`}
            hitSlop={hitSlopFor(24)}
            style={styles.dismiss}
          >
            <MobileText variant="caption" color="muted" style={styles.dismissGlyph}>
              ✕
            </MobileText>
          </Pressable>
        ) : null}
      </View>
    </MobileSurface>
  )

  if (!onPress) {
    return (
      <View testID={testID} style={style}>
        {content}
      </View>
    )
  }

  const handlePress = () => {
    hapticLight()
    onPress()
  }

  const handlePressIn = () => {
    pressInTiming(pressAnim, 0.98).start()
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
      accessibilityLabel={`${title}${unread ? ", unread" : ""}${body ? `. ${body}` : ""}`}
      style={[style, { transform: [{ scale: pressAnim }] }]}
    >
      {content}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    minHeight: metrics.minTouchTarget,
  },
  iconBox: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  title: {
    flex: 1,
    flexShrink: 1,
  },
  dot: {
    alignItems: "center",
    justifyContent: "center",
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
