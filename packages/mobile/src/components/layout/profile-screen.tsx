import * as React from "react"
import { StyleSheet, View, type ImageSourcePropType } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileButton } from "../primitive/button"
import { MobileText } from "../primitive/text"
import { MobileKeyValueRow } from "../composite/key-value-row"
import { MobileProfileHeader } from "../composite/profile-header"
import { MobileScreen, type MobileScreenProps } from "./screen"

export interface MobileProfileScreenRow {
  /** Row label, e.g. "Email". */
  label: string
  /** Row value, e.g. "ada@example.com". */
  value: string
  /** Makes the row tappable — a chevron appears and the row announces as a button. */
  onPress?: () => void
}

export interface MobileProfileScreenSection {
  /** Group header rendered above the rows. */
  title?: string
  /** The rows, in order. */
  rows: MobileProfileScreenRow[]
}

export interface MobileProfileScreenProps
  extends Omit<MobileScreenProps, "children"> {
  /** Display name. */
  name: string
  /** Handle shown beneath the name, e.g. "@ada". */
  handle?: string
  /** Overrides the initials generated from `name`. */
  initials?: string
  /** Avatar image. Falls back to initials when absent. */
  imageSource?: ImageSourcePropType
  /** Stat pills rendered under the identity block, e.g. followers/following. */
  stats?: { label: string; value: string }[]
  /** Titled groups of key/value rows beneath the header. */
  sections?: MobileProfileScreenSection[]
  /** Renders an "Edit" affordance in the header's right slot. */
  onEdit?: () => void
  /** Label for the edit affordance. @default 'Edit' */
  editLabel?: string
  /** Extra content rendered after the last section. */
  children?: React.ReactNode
}

/**
 * MobileProfileScreen
 *
 * User profile page: identity header, optional edit action, and any number of
 * key/value sections.
 *
 * The edit action lives in the nav bar's right slot rather than under the
 * header, because profile editing is a screen-level affordance — pinning it to
 * the header keeps it reachable no matter how far the sections have scrolled.
 *
 * Sections reuse `MobileKeyValueRow` on a card surface with the same rhythm as
 * `MobileSettingsSection`, so a profile and a settings page read as siblings.
 */
export function MobileProfileScreen({
  name,
  handle,
  initials,
  imageSource,
  stats,
  sections,
  onEdit,
  editLabel = "Edit",
  children,
  headerRight,
  title = "Profile",
  largeTitle = true,
  contentContainerStyle,
  ...screenProps
}: MobileProfileScreenProps) {
  const { colors } = useMobileTheme()

  const resolvedHeaderRight = onEdit ? (
    <MobileButton
      size="sm"
      variant="ghost"
      onPress={onEdit}
      accessibilityHint="Edits the profile"
    >
      {editLabel}
    </MobileButton>
  ) : (
    headerRight
  )

  return (
    <MobileScreen
      {...screenProps}
      title={title}
      largeTitle={largeTitle}
      headerRight={resolvedHeaderRight}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      <MobileProfileHeader
        name={name}
        handle={handle}
        initials={initials}
        imageSource={imageSource}
        stats={stats}
      />

      {sections?.map((section, sectionIndex) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: sections are a static, caller-declared list and are never reordered
        <View key={`profile-section-${sectionIndex}`} style={styles.section}>
          {section.title ? (
            <MobileText variant="label" color="muted" style={styles.sectionTitle}>
              {section.title}
            </MobileText>
          ) : null}
          <View
            style={[
              styles.surface,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            {section.rows.map((row, rowIndex) => (
              <MobileKeyValueRow
                key={`${row.label}-${rowIndex}`}
                label={row.label}
                value={row.value}
                onPress={row.onPress}
              />
            ))}
          </View>
        </View>
      ))}

      {children}
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 28,
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
})
