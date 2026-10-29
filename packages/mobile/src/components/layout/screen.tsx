import * as React from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import {
  useSafeAreaInsets,
  type Edge,
} from "react-native-safe-area-context"
import { useMobileTheme } from "../../host"
import type { ColorRamp } from "../../tokens"
import { MobileNavBar } from "../composite/navbar"

const DEFAULT_EDGES: Edge[] = ["top", "bottom"]

export interface MobileScreenProps {
  /**
   * Screen body. Placed inside the scroll view when `scroll` is set, otherwise
   * in a plain flex container.
   */
  children?: React.ReactNode
  /**
   * Header title. Passing any of `title`, `subtitle`, `onBack`, `headerLeft` or
   * `headerRight` renders the built-in `MobileNavBar`; passing `header` instead
   * replaces it entirely.
   */
  title?: string
  /**
   * Optional line beneath the header title.
   */
  subtitle?: string
  /**
   * Full header replacement. When supplied, every other header prop is ignored
   * and no nav bar is rendered.
   */
  header?: React.ReactNode
  /**
   * Left header slot. Overrides the built-in back button.
   */
  headerLeft?: React.ReactNode
  /**
   * Right header slot, typically one or two `MobileIconButton`s.
   */
  headerRight?: React.ReactNode
  /**
   * Renders a back affordance in the header.
   */
  onBack?: () => void
  /**
   * Screen-reader label for the back affordance.
   * @default 'Go back'
   */
  backAccessibilityLabel?: string
  /**
   * iOS-style large title. Maps to `MobileNavBar`'s `large`.
   * @default false
   */
  largeTitle?: boolean
  /**
   * Hairline under the header. Maps to `MobileNavBar`'s `bordered`.
   * @default true
   */
  headerBordered?: boolean
  /**
   * Wraps the body in a `ScrollView`. Turn this off for a screen that manages
   * its own scrolling (a pager, a map, a list) — nesting scroll views breaks
   * gesture handling.
   * @default true
   */
  scroll?: boolean
  /**
   * Wraps the body in a `KeyboardAvoidingView` so the focused field stays above
   * the keyboard. Required for any screen with inputs.
   * @default false
   */
  keyboardAvoiding?: boolean
  /**
   * Extra offset for `keyboardAvoiding`, for screens nested under another
   * header.
   * @default 0
   */
  keyboardVerticalOffset?: number
  /**
   * Which safe-area edges to pad. The padding is applied to the *frame*, not the
   * content, so the background colour still fills the notch and the home
   * indicator.
   * @default ['top', 'bottom']
   */
  edges?: Edge[]
  /**
   * Frame background, as a semantic token key or a raw colour.
   * @default 'background'
   */
  background?: keyof ColorRamp | string
  /**
   * Style for the scroll content container (or the plain body container when
   * `scroll` is false). Use this for horizontal padding.
   */
  contentContainerStyle?: StyleProp<ViewStyle>
  /**
   * Pinned footer, rendered outside the scroll view so it never scrolls away.
   * Use it for a primary action or a pager's dots.
   */
  footer?: React.ReactNode
  /**
   * Hairline above the pinned footer.
   * @default true
   */
  footerBordered?: boolean
  /**
   * Optional style override for the frame.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileScreen
 *
 * The base frame. Every other layout component composes this rather than
 * re-deriving safe area, scrolling and keyboard behaviour — which is what keeps
 * the screens from drifting apart.
 *
 * Three decisions worth knowing about:
 *
 * 1. **Safe-area padding goes on the frame, not the content.** The frame's
 *    background then fills the notch and the home-indicator strip, instead of
 *    leaving two bare bands of window colour at the top and bottom.
 * 2. **The scroll content grows.** The content container gets `flexGrow: 1`, so
 *    short content can be centred vertically while long content still scrolls —
 *    which is exactly the auth-screen case.
 * 3. **The footer sits outside the scroll view.** A pinned action or pager must
 *    not scroll away from the thumb.
 *
 * This component does not render a `SafeAreaProvider` — the app root owns that.
 * Outside a provider the insets resolve to zero, so the screen still renders,
 * just without safe-area padding.
 */
export function MobileScreen({
  children,
  title,
  subtitle,
  header,
  headerLeft,
  headerRight,
  onBack,
  backAccessibilityLabel = "Go back",
  largeTitle = false,
  headerBordered = true,
  scroll = true,
  keyboardAvoiding = false,
  keyboardVerticalOffset = 0,
  edges = DEFAULT_EDGES,
  background = "background",
  contentContainerStyle,
  footer,
  footerBordered = true,
  style,
  testID,
}: MobileScreenProps) {
  const { colors } = useMobileTheme()
  const insets = useSafeAreaInsets()

  const resolvedBackground = (
    background in colors ? colors[background as keyof ColorRamp] : background
  ) as string

  const paddingTop = edges.includes("top") ? insets.top : 0
  const paddingBottom = edges.includes("bottom") ? insets.bottom : 0

  const hasHeaderContent = Boolean(
    title || subtitle || onBack || headerLeft || headerRight
  )

  const resolvedHeader =
    header !== undefined ? (
      header
    ) : hasHeaderContent ? (
      <MobileNavBar
        title={title}
        subtitle={subtitle}
        left={headerLeft}
        right={headerRight}
        onBack={onBack}
        backAccessibilityLabel={backAccessibilityLabel}
        large={largeTitle}
        bordered={headerBordered}
      />
    ) : null

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: paddingBottom + 24 },
        contentContainerStyle,
      ]}
      // Without this, the first tap on a button while the keyboard is open only
      // dismisses the keyboard and the button never fires.
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.flex,
        { paddingBottom: paddingBottom },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  )

  const inner = (
    <>
      {body}
      {footer ? (
        <View
          style={[
            styles.footer,
            {
              borderTopColor: colors.border,
              borderTopWidth: footerBordered ? 1 : 0,
              paddingBottom: paddingBottom + 12,
            },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </>
  )

  return (
    <View
      testID={testID}
      style={[
        styles.root,
        { backgroundColor: resolvedBackground, paddingTop },
        style,
      ]}
    >
      {resolvedHeader}
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          // On Android the window already resizes, so adding padding as well
          // double-counts the keyboard height.
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.flex}>{inner}</View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
})
