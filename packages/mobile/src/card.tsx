import * as React from "react"
import { View, StyleSheet, type ViewStyle, Platform } from "react-native"
import { useMobileTheme } from "./host"
import { MobileText } from "./text"
import { metrics } from "./tokens"

export interface MobileCardProps {
  children?: React.ReactNode
  style?: ViewStyle
}

/**
 * MobileCard
 *
 * Surface container with physical depth, subtle border,
 * and semantic light/dark token awareness.
 */
export function MobileCard({ children, style }: MobileCardProps) {
  const { colors, colorScheme } = useMobileTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          shadowColor: colorScheme === "dark" ? "#000000" : "#0f172a",
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

export function MobileCardHeader({
  children,
  style,
}: {
  children?: React.ReactNode
  style?: ViewStyle
}) {
  return <View style={[styles.header, style]}>{children}</View>
}

export function MobileCardTitle({
  children,
  style,
}: {
  children?: React.ReactNode
  style?: ViewStyle
}) {
  if (typeof children === "string") {
    return (
      <MobileText variant="title" style={style}>
        {children}
      </MobileText>
    )
  }
  return <View style={style}>{children}</View>
}

export function MobileCardDescription({
  children,
  style,
}: {
  children?: React.ReactNode
  style?: ViewStyle
}) {
  if (typeof children === "string") {
    return (
      <MobileText
        variant="callout"
        color="muted"
        style={[styles.description, style]}
      >
        {children}
      </MobileText>
    )
  }
  return <View style={[styles.description, style]}>{children}</View>
}

export function MobileCardContent({
  children,
  style,
}: {
  children?: React.ReactNode
  style?: ViewStyle
}) {
  return <View style={[styles.content, style]}>{children}</View>
}

export function MobileCardFooter({
  children,
  style,
}: {
  children?: React.ReactNode
  style?: ViewStyle
}) {
  return <View style={[styles.footer, style]}>{children}</View>
}

const styles = StyleSheet.create({
  card: {
    borderRadius: metrics.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    marginVertical: 6,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  description: {
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
})
