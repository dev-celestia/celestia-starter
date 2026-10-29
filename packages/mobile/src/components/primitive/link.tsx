import * as React from "react"
import {
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { MobileText } from "./text"
import { metrics } from "../../tokens"

export interface MobileLinkProps {
  /**
   * Link text or custom content.
   */
  children?: React.ReactNode
  /**
   * Called when the link is activated.
   */
  onPress?: () => void
  /**
   * `inline` sits inside a paragraph of text; `standalone` is a full-width
   * tappable row with a trailing chevron.
   * @default 'inline'
   */
  variant?: "inline" | "standalone"
  /**
   * Whether the link is disabled.
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

/**
 * MobileLink
 *
 * Navigational text. Two shapes:
 *
 * - `inline` — coloured and underlined, for use inside a sentence.
 * - `standalone` — a full-width row with a trailing chevron and a 44pt hit area.
 *
 * Deliberately not hover-dependent: the affordance is colour + underline +
 * chevron, all of which are visible without a pointer.
 */
export function MobileLink({
  children,
  onPress,
  variant = "inline",
  disabled = false,
  style,
  testID,
}: MobileLinkProps) {
  const { colors } = useMobileTheme()

  const handlePress = () => {
    if (disabled || !onPress) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    onPress()
  }

  if (variant === "standalone") {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        testID={testID}
        accessibilityRole="link"
        accessibilityState={{ disabled }}
        style={[styles.standalone, { opacity: disabled ? 0.45 : 1 }, style]}
      >
        <View style={styles.standaloneText}>
          {typeof children === "string" ? (
            <MobileText variant="bodyMedium" color="primary">
              {children}
            </MobileText>
          ) : (
            children
          )}
        </View>
        <MobileText variant="bodyMedium" color="muted" style={styles.chevron}>
          ›
        </MobileText>
      </Pressable>
    )
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="link"
      accessibilityState={{ disabled }}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      style={disabled ? { opacity: 0.45 } : undefined}
    >
      {typeof children === "string" ? (
        <MobileText
          variant="body"
          style={{
            color: colors.primary,
            textDecorationLine: "underline",
          }}
        >
          {children}
        </MobileText>
      ) : (
        children
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  standalone: {
    minHeight: metrics.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  standaloneText: {
    flex: 1,
    paddingRight: 12,
  },
  chevron: {
    fontWeight: "600",
  },
})
