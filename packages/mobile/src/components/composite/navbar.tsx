import * as React from "react"
import {
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"

export interface MobileNavBarProps {
  /**
   * Primary title.
   */
  title?: string
  /**
   * Optional line beneath the title.
   */
  subtitle?: string
  /**
   * Left slot. Overrides the built-in back button when provided.
   */
  left?: React.ReactNode
  /**
   * Right slot, typically one or two `MobileIconButton`s.
   */
  right?: React.ReactNode
  /**
   * Renders a back affordance in the left slot. Ignored when `left` is set.
   */
  onBack?: () => void
  /**
   * Screen-reader label for the back affordance.
   * @default 'Go back'
   */
  backAccessibilityLabel?: string
  /**
   * iOS-style large title: the bar keeps only the slots, and the title is
   * rendered below it in the `display` role.
   * @default false
   */
  large?: boolean
  /**
   * Draws a hairline bottom border.
   * @default true
   */
  bordered?: boolean
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
 * MobileNavBar
 *
 * Screen header with left / centre / right slots.
 *
 * The three columns are `flex: 1 / 2 / 1`, which is what actually centres the
 * title — a naive `justifyContent: "center"` shifts it off-centre as soon as
 * the right slot holds two buttons instead of one. The title is clamped to a
 * single line so a long string can never push the slots out of the bar.
 */
export function MobileNavBar({
  title,
  subtitle,
  left,
  right,
  onBack,
  backAccessibilityLabel = "Go back",
  large = false,
  bordered = true,
  style,
  testID,
}: MobileNavBarProps) {
  const { colors } = useMobileTheme()

  const handleBack = () => {
    if (!onBack) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    onBack()
  }

  const backButton = onBack ? (
    <Pressable
      onPress={handleBack}
      accessibilityRole="button"
      accessibilityLabel={backAccessibilityLabel}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.back}
    >
      <MobileText
        variant="title"
        style={[styles.backGlyph, { color: colors.foreground }]}
      >
        ‹
      </MobileText>
    </Pressable>
  ) : null

  const leading = left ?? backButton

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
          borderBottomWidth: bordered ? 1 : 0,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.side}>{leading}</View>

        {large ? (
          <View style={styles.sideEnd}>{right}</View>
        ) : (
          <>
            <View style={styles.center}>
              {title ? (
                <MobileText
                  variant="title"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {title}
                </MobileText>
              ) : null}
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
            <View style={styles.sideEnd}>{right}</View>
          </>
        )}
      </View>

      {large && title ? (
        <View style={styles.largeTitle}>
          <MobileText variant="display" numberOfLines={2}>
            {title}
          </MobileText>
          {subtitle ? (
            <MobileText
              variant="callout"
              color="muted"
              style={styles.largeSubtitle}
            >
              {subtitle}
            </MobileText>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  row: {
    minHeight: metrics.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  side: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  center: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sideEnd: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  back: {
    width: metrics.minTouchTarget,
    height: metrics.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  backGlyph: {
    fontSize: 30,
    lineHeight: 34,
  },
  largeTitle: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  largeSubtitle: {
    marginTop: 2,
  },
})
