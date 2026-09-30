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
import { metrics } from "../../tokens"
import { hapticLight } from "../../utils"

export interface MobileTransactionRowProps {
  /**
   * Merchant or description.
   */
  title: string
  /**
   * Secondary line — category, account, note.
   */
  subtitle?: string
  /**
   * Pre-formatted amount, e.g. "-$12.40". Rendered right-aligned in tabular
   * numerals so decimal points line up down the list.
   */
  amount: string
  /**
   * Semantic colour for the amount: `success` for credits, `destructive` for
   * declines, `default` for everything else.
   * @default 'default'
   */
  amountTone?: "default" | "success" | "destructive"
  /**
   * Leading icon slot, rendered inside a muted 40pt box.
   */
  icon?: React.ReactNode
  /**
   * Timestamp caption under the amount.
   */
  time?: string
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
 * MobileTransactionRow
 *
 * Ledger line: icon box, title/subtitle, right-aligned tabular amount and an
 * optional time caption.
 *
 * The amount is the scanning anchor of a transaction list, so it owns the
 * right edge and the tabular numerals; everything else truncates around it.
 * Colour tone is redundant with the sign the consumer formats into `amount`,
 * which keeps meaning available without colour.
 */
export function MobileTransactionRow({
  title,
  subtitle,
  amount,
  amountTone = "default",
  icon,
  time,
  onPress,
  style,
  testID,
}: MobileTransactionRowProps) {
  const { colors } = useMobileTheme()
  const pressAnim = React.useRef(new Animated.Value(1)).current

  const amountColor =
    amountTone === "success"
      ? colors.success
      : amountTone === "destructive"
        ? colors.destructive
        : colors.foreground

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
          {title}
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

      <View style={styles.amountColumn}>
        <MobileText variant="bodyMedium" color={amountColor} tabular numberOfLines={1}>
          {amount}
        </MobileText>
        {time ? (
          <MobileText variant="caption" color="muted" tabular numberOfLines={1}>
            {time}
          </MobileText>
        ) : null}
      </View>
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
      accessibilityLabel={`${title}. Amount ${amount}${time ? `. ${time}` : ""}`}
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
    paddingVertical: 10,
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
  amountColumn: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
})
