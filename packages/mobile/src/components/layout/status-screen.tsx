import * as React from "react"
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import type { ColorRamp } from "../../tokens"
import { MobileText } from "../primitive/text"
import { MobileScreen, type MobileScreenProps } from "./screen"

export type MobileStatusVariant =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "notFound"
  | "maintenance"

/**
 * Which semantic ramp each status draws from.
 *
 * Declarative on purpose: adding a status should mean adding one line here, not
 * editing a chain of ternaries that has to stay in the same order as the union.
 */
const ACCENT_TOKEN: Record<MobileStatusVariant, keyof ColorRamp> = {
  success: "success",
  error: "destructive",
  warning: "warning",
  info: "info",
  notFound: "muted",
  maintenance: "warning",
}

/**
 * Fallback marks, drawn as text glyphs rather than shipped as icons.
 *
 * This follows the package's existing convention — `MobileNavBar` draws "‹",
 * `MobileSettingRow` draws "›", `MobileAlert` draws "✕" — because a status
 * screen must not be the reason the package acquires an icon dependency. Callers
 * with a real icon set override it through the `icon` prop.
 */
const DEFAULT_GLYPH: Record<MobileStatusVariant, string> = {
  success: "✓",
  error: "✕",
  warning: "!",
  info: "i",
  notFound: "?",
  maintenance: "…",
}

export interface MobileStatusScreenProps
  extends Omit<
    MobileScreenProps,
    | "children"
    | "header"
    | "headerLeft"
    | "headerRight"
    | "title"
    | "subtitle"
    | "largeTitle"
    | "footer"
  > {
  /**
   * Semantic tone. Drives the indicator colour and the announcement behaviour.
   * @default 'info'
   */
  variant?: MobileStatusVariant
  /**
   * Replaces the built-in glyph. Icons arrive as props.
   */
  icon?: React.ReactNode
  /**
   * Headline. Announced as a header.
   */
  title: string
  /**
   * Supporting copy beneath the headline.
   */
  message?: string
  /**
   * The main action, typically a `MobileButton`.
   */
  primaryAction?: React.ReactNode
  /**
   * A secondary action, typically an outline `MobileButton`.
   */
  secondaryAction?: React.ReactNode
  /**
   * Style for the content container.
   */
  contentContainerStyle?: StyleProp<ViewStyle>
}

/**
 * MobileStatusScreen
 *
 * Full-screen outcome: success, error, warning, info, not-found or maintenance.
 *
 * It carries the same `accessibilityRole="alert"` treatment as `MobileAlert` for
 * the error tone only. A success screen is the expected result of an action the
 * user just took, so interrupting to announce it would be noise; a failure is
 * not expected, so it interrupts.
 *
 * Scrolling is off by default because the content is a short centred block, and
 * a scroll view around it would add a bounce that has nothing to scroll.
 */
export function MobileStatusScreen({
  variant = "info",
  icon,
  title,
  message,
  primaryAction,
  secondaryAction,
  contentContainerStyle,
  ...screenProps
}: MobileStatusScreenProps) {
  const { colors } = useMobileTheme()

  const accent = colors[ACCENT_TOKEN[variant]]

  return (
    <MobileScreen
      {...screenProps}
      scroll={false}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      <View
        accessibilityRole={variant === "error" ? "alert" : undefined}
        style={styles.block}
      >
        <View
          style={[
            styles.indicator,
            { borderColor: accent, backgroundColor: colors.card },
          ]}
        >
          {icon ?? (
            <MobileText
              variant="display"
              align="center"
              style={[styles.glyph, { color: accent }]}
            >
              {DEFAULT_GLYPH[variant]}
            </MobileText>
          )}
        </View>

        <MobileText
          variant="heading"
          align="center"
          accessibilityRole="header"
          style={styles.title}
        >
          {title}
        </MobileText>

        {message ? (
          <MobileText
            variant="body"
            color="muted"
            align="center"
            style={styles.message}
          >
            {message}
          </MobileText>
        ) : null}

        {primaryAction || secondaryAction ? (
          <View style={styles.actions}>
            {primaryAction}
            {secondaryAction}
          </View>
        ) : null}
      </View>
    </MobileScreen>
  )
}

const INDICATOR_SIZE = 72

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 32,
    justifyContent: "center",
  },
  block: {
    alignItems: "center",
  },
  indicator: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  glyph: {
    lineHeight: 38,
  },
  title: {
    marginBottom: 0,
  },
  message: {
    marginTop: 8,
  },
  actions: {
    width: "100%",
    marginTop: 32,
    gap: 10,
  },
})
