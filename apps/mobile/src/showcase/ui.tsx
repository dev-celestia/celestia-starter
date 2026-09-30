import * as React from "react"
import { StyleSheet, View, type TextStyle } from "react-native"
import {
  MobileCard,
  MobileCardContent,
  MobileCardDescription,
  MobileCardHeader,
  MobileCardTitle,
  MobilePressableScale,
  MobileText,
  useMobileTheme,
} from "@celestia-project/mobile"
import { useSectionKey, useShowcaseNav } from "./nav"
import { SPACE } from "./spacing"

/**
 * Presentational helpers used by every showcase section.
 *
 * These are **not** part of `@celestia-project/mobile`. They exist only to give
 * the gallery a consistent rhythm. Anything that looks like a real product
 * concern — a form, a screen, a settings list — is demonstrated with the
 * package's own components instead, so the showcase never teaches a pattern the
 * library does not ship.
 *
 * Every colour here comes from `useMobileTheme()`. The previous version of this
 * app hardcoded `#09090b` / `#ffffff` / `#27272a` / `#e2e8f0` at the call site,
 * which meant the gallery went stale the moment a token changed and would have
 * broken outright in light mode.
 */

/**
 * The spacing scale, re-exported so a section needs one import rather than two.
 * Defined in `./spacing` — see that module for why it is not defined here.
 */
export { SPACE }

export function ShowcaseSectionHeader({
  index,
  title,
  summary,
}: {
  index: number
  title: string
  summary: string
}) {
  return (
    <View style={styles.sectionHeader}>
      <MobileText variant="label" color="muted">
        {String(index).padStart(2, "0")}
      </MobileText>
      <MobileText variant="heading">{title}</MobileText>
      <MobileText variant="callout" color="muted" style={styles.sectionSummary}>
        {summary}
      </MobileText>
    </View>
  )
}

/**
 * The label above a sub-demo inside a specimen — "Sizes", "Disabled", "Bar —
 * grouped, two series".
 *
 * This is a component rather than a convention because it was previously
 * written out by hand as a `MobileText` followed by a `Spacer`, and the two
 * halves drifted independently: the spacer was 6, 8, 10, 12 or 14 depending on
 * the section, and a handful of call sites used `bodyMedium` at full foreground
 * weight where the rest used `caption` in muted. Pairing the label with its own
 * gap is what makes the seven sections agree.
 *
 * `style` is for alignment only — never for re-typing the label.
 */
export function DemoLabel({
  children,
  style,
}: {
  children: string
  style?: TextStyle
}) {
  return (
    <MobileText
      variant="caption"
      color="muted"
      style={[styles.demoLabel, style]}
    >
      {children}
    </MobileText>
  )
}

/**
 * A titled card wrapping one demonstration, with the module path printed
 * underneath so it is obvious which import produced the result.
 *
 * Each specimen files itself with the jump menu (`nav.tsx`) as it mounts — it
 * knows its own title, and the section key arrives by context — so the menu is
 * assembled from what actually rendered rather than from a second hand-kept list
 * that could drift. The wrapper `View` exists only to give `jumpTo` a node it can
 * measure: `MobileCard` takes no ref.
 *
 * `bleed` drops the card's content padding so a demo that needs the full width
 * of the card — the nav bars, which draw their own edge-to-edge chrome — does
 * not have to claw the padding back with a negative margin. That hack lived in
 * `navigation.tsx` as `marginHorizontal: -16`, hardcoding a number owned by
 * `MobileCardContent`; when the card's padding changes, `bleed` follows and the
 * hack does not.
 *
 * Only use `bleed` when *everything* in the specimen is edge-to-edge. It removes
 * the horizontal inset for the whole content area, so a readout or a caption
 * mixed in with the bar would end up flush against the card's edge; those
 * specimens should stay inset. The module path is the one exception — it is
 * re-inset for you.
 *
 * `onPress` turns the whole card into one control and marks it with a chevron.
 * It exists for the Screens section, whose modules cannot be demonstrated inline
 * — each one owns a full safe area and a full scroll view, so the card is a
 * launcher rather than a container. A card that launches something should be one
 * tap target, not a card that happens to contain a button; and routing it
 * through `MobilePressableScale` means the launcher is built from the library's
 * own press wrapper, which is the pattern the Actions section teaches.
 */
export function Specimen({
  title,
  description,
  modulePath,
  bleed = false,
  onPress,
  children,
}: {
  title: string
  description?: string
  modulePath?: string
  bleed?: boolean
  onPress?: () => void
  children?: React.ReactNode
}) {
  const nav = useShowcaseNav()
  const sectionKey = useSectionKey()

  const anchorKey = `specimen:${sectionKey}:${title}`
  const hasContent = React.Children.count(children) > 0

  React.useEffect(() => {
    nav?.declareEntry({
      key: anchorKey,
      title,
      sectionKey,
      kind: "specimen",
    })
  }, [nav, anchorKey, title, sectionKey])

  const setAnchor = React.useCallback(
    (node: View | null) => nav?.attachAnchor(anchorKey, node),
    [nav, anchorKey]
  )

  // A launcher has no content, so its module path belongs in the header block
  // rather than in a content area that does not exist.
  const path = modulePath ? (
    <MobileText
      variant="caption"
      color="muted"
      style={
        hasContent
          ? bleed
            ? styles.bleedModulePath
            : styles.modulePath
          : styles.headerModulePath
      }
    >
      {modulePath}
    </MobileText>
  ) : null

  const card = (
    <MobileCard style={styles.specimen}>
      <MobileCardHeader>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <MobileCardTitle>{title}</MobileCardTitle>
            {description ? (
              <MobileCardDescription>{description}</MobileCardDescription>
            ) : null}
            {hasContent ? null : path}
          </View>
          {onPress ? (
            <MobileText variant="title" color="muted">
              ›
            </MobileText>
          ) : null}
        </View>
      </MobileCardHeader>
      {hasContent ? (
        bleed ? (
          <View style={styles.bleedContent}>
            {children}
            {path}
          </View>
        ) : (
          <MobileCardContent>
            {children}
            {path}
          </MobileCardContent>
        )
      ) : null}
    </MobileCard>
  )

  return (
    <View ref={setAnchor}>
      {onPress ? (
        <MobilePressableScale
          onPress={onPress}
          accessibilityLabel={title}
          // The press wrapper's own default is `alignSelf: flex-start`, which
          // would shrink-wrap the card; the launcher has to fill the column.
          containerStyle={styles.launcher}
        >
          {card}
        </MobilePressableScale>
      ) : (
        card
      )}
    </View>
  )
}

/** Vertical stack with a consistent gap. */
export function Stack({
  children,
  gap = SPACE.row,
}: {
  children?: React.ReactNode
  gap?: number
}) {
  return <View style={{ gap }}>{children}</View>
}

/** Horizontal row that can wrap — used for variant swatches. */
export function Row({
  children,
  gap = SPACE.label,
  wrap = true,
  align = "center",
}: {
  children?: React.ReactNode
  gap?: number
  wrap?: boolean
  align?: "center" | "flex-start" | "flex-end"
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: align,
        flexWrap: wrap ? "wrap" : "nowrap",
        gap,
      }}
    >
      {children}
    </View>
  )
}

/**
 * Fixed-height gap, for the places where `gap` is not available.
 *
 * Pass a `SPACE` step. The gallery used to pick from eight values here; if a
 * gap genuinely needs a step the scale does not have, add the step rather than
 * a magic number.
 */
export function Spacer({ size }: { size: number }) {
  return <View style={{ height: size }} />
}

/**
 * Icons live in `./icons`.
 *
 * This module used to export a `Glyph` helper that rendered an icon slot with a
 * text character, because the showcase had no icon set. It has one now, so every
 * slot gets a real icon and the stand-in is gone — `ShowcaseIcon` is the single
 * entry point.
 */

/** A colour chip labelled with its token name. */
export function Swatch({ token, value }: { token: string; value: string }) {
  const { colors } = useMobileTheme()

  return (
    <View style={styles.swatch}>
      <View
        accessible={false}
        importantForAccessibility="no"
        style={[
          styles.swatchChip,
          { backgroundColor: value, borderColor: colors.border },
        ]}
      />
      <MobileText variant="caption" color="muted">
        {token}
      </MobileText>
    </View>
  )
}

/** A read-only key/value line, for showing live state inside a specimen. */
export function Readout({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.readout}>
      <MobileText variant="caption" color="muted">
        {label}
      </MobileText>
      <MobileText variant="caption" tabular>
        {value}
      </MobileText>
    </View>
  )
}

const styles = StyleSheet.create({
  /**
   * `section` above, `row` below. The asymmetry is the hierarchy: a heading sits
   * closer to its own first card than to the section before it, so the grouping
   * is legible without a rule or a divider.
   */
  sectionHeader: {
    marginTop: SPACE.section,
    marginBottom: SPACE.row,
    gap: 2,
  },
  sectionSummary: {
    marginTop: 2,
  },
  /**
   * The card's own `marginVertical` is neutralised so `Specimen` owns the
   * rhythm. `MobileCard` ships `marginVertical: 6`, which combined with the old
   * `marginBottom: 4` gave a specimen-to-specimen gap of 16 but a
   * heading-to-first-card gap of 10 — the same relationship rendered two ways.
   */
  specimen: {
    marginTop: 0,
    marginBottom: SPACE.block,
  },
  demoLabel: {
    marginBottom: SPACE.label,
  },
  modulePath: {
    marginTop: SPACE.row,
  },
  /**
   * A launcher card is header-only, so the title/description/chevron need a row
   * and the path hangs under the description rather than under a content area.
   */
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACE.row,
  },
  headerText: {
    flex: 1,
  },
  headerModulePath: {
    marginTop: SPACE.label,
  },
  launcher: {
    alignSelf: "stretch",
  },
  /** Full-bleed demos keep their own padding, so only the bottom is inset. */
  bleedContent: {
    paddingBottom: SPACE.row,
  },
  bleedModulePath: {
    marginTop: SPACE.row,
    paddingHorizontal: SPACE.block,
  },
  swatch: {
    alignItems: "center",
    gap: SPACE.inline,
    width: 78,
  },
  swatchChip: {
    width: 46,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
  },
  readout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACE.row,
    marginTop: SPACE.label,
  },
})
