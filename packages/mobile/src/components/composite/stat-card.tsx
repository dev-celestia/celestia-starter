import * as React from "react"
import {
  Pressable,
  View,
  StyleSheet,
  Animated,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { pressInTiming, springTo } from "../../motion"
import { MobileText } from "../primitive/text"
import { MobileSurface } from "../primitive/surface"
import { metrics } from "../../tokens"
import { hapticLight } from "../../utils"

export interface MobileStatCardProps {
  /**
   * Metric name, rendered as a muted caption.
   */
  label: string
  /**
   * Metric value, rendered in tabular numerals so columns of cards align.
   */
  value: string
  /**
   * Change indicator, e.g. "+12%". Prefixed with ▲/▼ from `deltaTone`.
   */
  delta?: string
  /**
   * Semantic colour (and arrow direction) for `delta`.
   * @default 'muted'
   */
  deltaTone?: "success" | "destructive" | "muted"
  /**
   * Optional leading icon slot.
   */
  icon?: React.ReactNode
  /**
   * Makes the card pressable. Omit for a purely informational card — it then
   * renders as a plain surface rather than a button with no action.
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
 * MobileStatCard
 *
 * One dashboard metric on a card surface: muted caption label, tabular title
 * value, optional ▲/▼ delta and icon slot.
 *
 * The arrow comes from `deltaTone`, not from parsing the string — colour alone
 * is not a meaning carrier (WCAG 1.4.1), so direction is encoded in the glyph
 * too. When pressable, the whole card is the touch target with a subtle
 * press-scale, matching the setting-row canon.
 */
export function MobileStatCard({
  label,
  value,
  delta,
  deltaTone = "muted",
  icon,
  onPress,
  style,
  testID,
}: MobileStatCardProps) {
  const { colors } = useMobileTheme()
  const pressAnim = React.useRef(new Animated.Value(1)).current

  const deltaColor =
    deltaTone === "success"
      ? colors.success
      : deltaTone === "destructive"
        ? colors.destructive
        : colors.muted
  const deltaPrefix =
    deltaTone === "success" ? "▲ " : deltaTone === "destructive" ? "▼ " : ""

  const content = (
    <MobileSurface variant="card" style={styles.surface}>
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
          <MobileText variant="caption" color="muted" numberOfLines={1}>
            {label}
          </MobileText>
          <View style={styles.valueRow}>
            <MobileText variant="title" tabular numberOfLines={1}>
              {value}
            </MobileText>
            {delta ? (
              <MobileText
                variant="callout"
                color={deltaColor}
                tabular
                numberOfLines={1}
              >
                {`${deltaPrefix}${delta}`}
              </MobileText>
            ) : null}
          </View>
        </View>
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
      accessibilityLabel={`${label}: ${value}${delta ? `, ${deltaPrefix}${delta}` : ""}`}
      style={[style, { transform: [{ scale: pressAnim }] }]}
    >
      {content}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  surface: {
    minHeight: metrics.minTouchTarget,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
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
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
})
