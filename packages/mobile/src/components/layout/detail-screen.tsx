import * as React from "react"
import { StyleSheet, View, type ImageSourcePropType } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileText } from "../primitive/text"
import { MobileImage } from "../primitive/image"
import { MobileKeyValueRow } from "../composite/key-value-row"
import { MobileScreen, type MobileScreenProps } from "./screen"

export interface MobileDetailScreenSection {
  /** Group header rendered above the rows. */
  title?: string
  /** The rows, in order. */
  rows: { label: string; value: string }[]
}

export interface MobileDetailScreenProps
  extends Omit<MobileScreenProps, "children" | "footer"> {
  /** Header title. */
  title?: string
  /** Full-bleed hero image at the top of the scroll view. */
  hero?: ImageSourcePropType
  /** Hero width-to-height ratio. @default 16 / 9 */
  heroRatio?: number
  /** Screen-reader description for the hero image. */
  heroAccessibilityLabel?: string
  /** Lede paragraph beneath the hero. */
  summary?: string
  /** Titled groups of key/value rows. */
  sections?: MobileDetailScreenSection[]
  /** Free-form body content after the summary and sections. */
  children?: React.ReactNode
  /** Pinned action bar — a `MobileButton` row that never scrolls away. */
  footer?: React.ReactNode
}

/**
 * MobileDetailScreen
 *
 * Record detail page: optional full-bleed hero, summary, key/value sections, a
 * free-form content slot, and a pinned footer action.
 *
 * The hero is the one element that escapes the content padding — a picture
 * inset by 16pt on each side reads as a thumbnail, while edge-to-edge reads as
 * the subject of the page. Everything below it returns to the standard gutter.
 *
 * The footer rides `MobileScreen`'s pinned slot, so the primary action stays
 * under the thumb no matter how long the record is.
 */
export function MobileDetailScreen({
  title,
  hero,
  heroRatio = 16 / 9,
  heroAccessibilityLabel,
  summary,
  sections,
  children,
  footer,
  contentContainerStyle,
  ...screenProps
}: MobileDetailScreenProps) {
  const { colors } = useMobileTheme()

  return (
    <MobileScreen
      {...screenProps}
      title={title}
      footer={footer}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      {hero ? (
        <MobileImage
          source={hero}
          ratio={heroRatio}
          radius={0}
          accessibilityLabel={heroAccessibilityLabel}
          style={styles.hero}
        />
      ) : null}

      <View style={styles.body}>
        {summary ? (
          <MobileText variant="body" color="muted" style={styles.summary}>
            {summary}
          </MobileText>
        ) : null}

        {sections?.map((section, sectionIndex) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: sections are a static, caller-declared list and are never reordered
          <View key={`detail-section-${sectionIndex}`} style={styles.section}>
            {section.title ? (
              <MobileText
                variant="label"
                color="muted"
                style={styles.sectionTitle}
              >
                {section.title}
              </MobileText>
            ) : null}
            <View
              style={[
                styles.surface,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              {section.rows.map((row, rowIndex) => (
                <MobileKeyValueRow
                  key={`${row.label}-${rowIndex}`}
                  label={row.label}
                  value={row.value}
                />
              ))}
            </View>
          </View>
        ))}

        {children}
      </View>
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  // The gutters live on the body, not the scroll content, so the hero can run
  // full-bleed to the screen edges.
  content: {
    padding: 0,
  },
  hero: {
    width: "100%",
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },
  summary: {
    marginBottom: 0,
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
