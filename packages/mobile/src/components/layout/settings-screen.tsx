import * as React from "react"
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileSeparator } from "../primitive/separator"
import { MobileText } from "../primitive/text"
import { MobileScreen, type MobileScreenProps } from "./screen"

export interface MobileSettingsSectionProps {
  /**
   * Group header, rendered above the surface. Case is applied by the platform's
   * text engine rather than by `toUpperCase()`, which would mangle locales whose
   * casing rules are not one-to-one (Turkish dotted/dotless i, for instance).
   */
  title?: string
  /**
   * Explanatory line beneath the surface.
   */
  footer?: string
  /**
   * The rows. Separators are inserted between them automatically, so a caller
   * never has to remember to add one — and can never end up with a stray divider
   * after the last row.
   */
  children?: React.ReactNode
  /**
   * Optional style override.
   */
  style?: StyleProp<ViewStyle>
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileSettingsSection
 *
 * A titled group of settings rows on a single surface.
 *
 * Rows are separated by the section, not by the caller. That is the whole point:
 * divider placement is exactly the kind of detail that drifts when every caller
 * does it by hand, and the "no divider after the last row" rule is easy to get
 * wrong and impossible to notice.
 */
export function MobileSettingsSection({
  title,
  footer,
  children,
  style,
  testID,
}: MobileSettingsSectionProps) {
  const { colors } = useMobileTheme()

  const rows = React.Children.toArray(children)

  return (
    <View testID={testID} style={[styles.section, style]}>
      {title ? (
        <MobileText
          variant="label"
          color="muted"
          style={styles.sectionTitle}
        >
          {title}
        </MobileText>
      ) : null}

      <View
        style={[
          styles.surface,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        {rows.map((row, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: children are a static list declared by the caller and never reordered
          <React.Fragment key={`settings-row-${index}`}>
            {index > 0 ? <MobileSeparator /> : null}
            {row}
          </React.Fragment>
        ))}
      </View>

      {footer ? (
        <MobileText
          variant="caption"
          color="muted"
          style={styles.sectionFooter}
        >
          {footer}
        </MobileText>
      ) : null}
    </View>
  )
}

export interface MobileSettingsScreenProps
  extends Omit<MobileScreenProps, "children" | "footer"> {
  /**
   * Sections, in order.
   */
  children?: React.ReactNode
  /**
   * Identity block above the first section — conventionally a profile card built
   * from `MobileCard` and `MobileAvatar`.
   */
  profile?: React.ReactNode
  /**
   * Content below the last section — conventionally the app version.
   *
   * Note that this replaces `MobileScreen`'s `footer` with an in-content
   * equivalent: a version string pinned to the bottom of the viewport would sit
   * on top of the rows, and it belongs at the end of the reading order instead.
   */
  footer?: React.ReactNode
  /**
   * Style for the scroll content container.
   */
  contentContainerStyle?: StyleProp<ViewStyle>
}

/**
 * MobileSettingsScreen
 *
 * Scrolling settings page composed of `MobileSettingsSection` groups.
 *
 * It is a thin wrapper over `MobileScreen` plus section spacing — deliberately.
 * All the frame behaviour (safe area, keyboard, background) belongs to
 * `MobileScreen`, and re-deriving it here is how the screens start to diverge.
 * The only thing this adds is the section rhythm and the profile slot.
 */
export function MobileSettingsScreen({
  children,
  profile,
  footer,
  largeTitle = true,
  contentContainerStyle,
  ...screenProps
}: MobileSettingsScreenProps) {
  return (
    <MobileScreen
      {...screenProps}
      largeTitle={largeTitle}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      {profile ? <View style={styles.profile}>{profile}</View> : null}

      <View style={styles.sections}>{children}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  profile: {
    marginBottom: 28,
  },
  sections: {
    gap: 28,
  },
  footer: {
    marginTop: 28,
    alignItems: "center",
  },
  section: {
    width: "100%",
  },
  sectionTitle: {
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  surface: {
    borderRadius: metrics.radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  sectionFooter: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
})
