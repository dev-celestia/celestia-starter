import * as React from "react"
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import { MobileAlert } from "../composite/alert"
import { MobileSeparator } from "../primitive/separator"
import { MobileText } from "../primitive/text"
import { MobileScreen, type MobileScreenProps } from "./screen"

export interface MobileAuthShellProps
  extends Omit<
    MobileScreenProps,
    | "title"
    | "subtitle"
    | "header"
    | "headerLeft"
    | "headerRight"
    | "largeTitle"
    | "footer"
    | "keyboardAvoiding"
  > {
  /**
   * Brand mark rendered above the heading. Icons arrive as props.
   */
  logo?: React.ReactNode
  /**
   * Headline. Rendered in the `display` role and announced as a header.
   */
  heading?: string
  /**
   * Supporting line beneath the heading.
   */
  subheading?: string
  /**
   * The form itself.
   */
  children?: React.ReactNode
  /**
   * Content below a labelled divider — conventionally the federated sign-in
   * buttons.
   */
  aside?: React.ReactNode
  /**
   * Caption on the divider between `children` and `aside`.
   * @default 'or'
   */
  asideLabel?: string
  /**
   * Bottom line, conventionally the "already have an account?" prompt. Unlike
   * `MobileScreen`'s footer this one scrolls with the content, because on an
   * auth screen it is part of the form's reading order rather than a pinned
   * action.
   */
  footer?: React.ReactNode
  /**
   * Form-level error, shown above the fields.
   */
  error?: string
  /**
   * Renders a dismiss affordance on the error when provided.
   */
  onDismissError?: () => void
  /**
   * Screen-reader label for the error's dismiss affordance.
   * @default 'Dismiss'
   */
  errorDismissAccessibilityLabel?: string
  /**
   * Style for the scroll content container.
   */
  contentContainerStyle?: StyleProp<ViewStyle>
}

/**
 * MobileAuthShell
 *
 * The frame shared by every authentication screen: logo, heading, subheading,
 * form slot, federated-sign-in slot and footer.
 *
 * It exists so the auth screens cannot drift apart. Each one supplies only its
 * own fields and defaults and delegates the entire frame here — which is why
 * sign-in, sign-up, forgot-password, reset-password and OTP-verify all share one
 * header rhythm, one error treatment and one keyboard behaviour. A new auth
 * screen that re-implements this header would immediately look like a different
 * app.
 *
 * Keyboard avoidance is always on and not exposed as a prop: every screen built
 * on this shell has at least one input, so there is no case where turning it off
 * would be correct.
 */
export function MobileAuthShell({
  logo,
  heading,
  subheading,
  children,
  aside,
  asideLabel = "or",
  footer,
  error,
  onDismissError,
  errorDismissAccessibilityLabel = "Dismiss",
  contentContainerStyle,
  ...screenProps
}: MobileAuthShellProps) {
  return (
    <MobileScreen
      {...screenProps}
      keyboardAvoiding
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      <View style={styles.header}>
        {logo ? <View style={styles.logo}>{logo}</View> : null}

        {heading ? (
          <MobileText
            variant="display"
            align="center"
            accessibilityRole="header"
          >
            {heading}
          </MobileText>
        ) : null}

        {subheading ? (
          <MobileText
            variant="callout"
            color="muted"
            align="center"
            style={styles.subheading}
          >
            {subheading}
          </MobileText>
        ) : null}
      </View>

      {error ? (
        <MobileAlert
          variant="destructive"
          title={error}
          onDismiss={onDismissError}
          dismissAccessibilityLabel={errorDismissAccessibilityLabel}
          style={styles.error}
        />
      ) : null}

      <View style={styles.form}>{children}</View>

      {aside ? (
        <View style={styles.aside}>
          <MobileSeparator label={asideLabel} />
          <View style={styles.asideContent}>{aside}</View>
        </View>
      ) : null}

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
  },
  logo: {
    marginBottom: 16,
  },
  subheading: {
    marginTop: 6,
  },
  error: {
    marginTop: 20,
  },
  form: {
    marginTop: 28,
    gap: 16,
  },
  aside: {
    marginTop: 28,
  },
  asideContent: {
    marginTop: 20,
  },
  footer: {
    marginTop: 28,
    alignItems: "center",
  },
})
