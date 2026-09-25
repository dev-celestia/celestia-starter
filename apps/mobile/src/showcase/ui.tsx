import * as React from "react"
import { StyleSheet, View } from "react-native"
import {
  MobileCard,
  MobileCardContent,
  MobileCardDescription,
  MobileCardHeader,
  MobileCardTitle,
  MobileText,
  useMobileTheme,
  type MobileTextVariant,
} from "@celestia-project/mobile"

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
 * A titled card wrapping one demonstration, with the module path printed
 * underneath so it is obvious which import produced the result.
 */
export function Specimen({
  title,
  description,
  modulePath,
  children,
}: {
  title: string
  description?: string
  modulePath?: string
  children?: React.ReactNode
}) {
  return (
    <MobileCard style={styles.specimen}>
      <MobileCardHeader>
        <MobileCardTitle>{title}</MobileCardTitle>
        {description ? (
          <MobileCardDescription>{description}</MobileCardDescription>
        ) : null}
      </MobileCardHeader>
      <MobileCardContent>
        {children}
        {modulePath ? (
          <MobileText variant="caption" color="muted" style={styles.modulePath}>
            {modulePath}
          </MobileText>
        ) : null}
      </MobileCardContent>
    </MobileCard>
  )
}

/** Vertical stack with a consistent gap. */
export function Stack({
  children,
  gap = 12,
}: {
  children?: React.ReactNode
  gap?: number
}) {
  return <View style={{ gap }}>{children}</View>
}

/** Horizontal row that can wrap — used for variant swatches. */
export function Row({
  children,
  gap = 8,
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

/** Fixed-height gap, for the places where `gap` is not available. */
export function Spacer({ size }: { size: number }) {
  return <View style={{ height: size }} />
}

/**
 * Icon stand-in.
 *
 * The package ships **no icon dependency** — every icon arrives as a prop. That
 * is why the showcase can render icon slots with a text glyph: it proves the
 * seam is real, and it keeps the demo honest about what the library provides.
 */
export function Glyph({
  glyph,
  size = "title",
}: {
  glyph: string
  size?: MobileTextVariant
}) {
  return (
    <MobileText variant={size} align="center">
      {glyph}
    </MobileText>
  )
}

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
  sectionHeader: {
    marginTop: 28,
    marginBottom: 4,
    gap: 2,
  },
  sectionSummary: {
    marginTop: 2,
  },
  specimen: {
    marginBottom: 4,
  },
  modulePath: {
    marginTop: 12,
  },
  swatch: {
    alignItems: "center",
    gap: 4,
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
    gap: 12,
    marginTop: 8,
  },
})
