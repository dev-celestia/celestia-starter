import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"

export interface MobileEmptyStateProps {
  /**
   * Illustration or icon node. Icons arrive as props.
   */
  icon?: React.ReactNode
  /**
   * Headline.
   */
  title: string
  /**
   * Optional supporting copy.
   */
  description?: string
  /**
   * Optional call to action, typically a `MobileButton`.
   */
  action?: React.ReactNode
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
 * MobileEmptyState
 *
 * Centred "nothing here yet" panel. The title carries `accessibilityRole="header"`
 * so a screen reader lands on it, and the whole block is announced as one unit
 * rather than as three unrelated strings.
 */
export function MobileEmptyState({
  icon,
  title,
  description,
  action,
  style,
  testID,
}: MobileEmptyStateProps) {
  const { colors } = useMobileTheme()

  return (
    <View
      testID={testID}
      accessible
      style={[styles.container, style]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}

      <MobileText
        variant="title"
        align="center"
        accessibilityRole="header"
      >
        {title}
      </MobileText>

      {description ? (
        <MobileText
          variant="callout"
          color="muted"
          align="center"
          style={styles.description}
        >
          {description}
        </MobileText>
      ) : null}

      {action ? (
        <View style={[styles.action, { borderColor: colors.border }]}>
          {action}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  icon: {
    marginBottom: 12,
  },
  description: {
    marginTop: 6,
  },
  action: {
    marginTop: 20,
  },
})
