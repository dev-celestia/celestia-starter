import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics, type ColorRamp } from "../../tokens"
import { isTextChildren } from "../../utils"
import { MobileText } from "./text"

export type MobileCalloutTone =
  | "info"
  | "success"
  | "warning"
  | "destructive"

/**
 * Tint strength over the surface fill — matches `MobileBanner` so the two
 * read as the same family at different scales.
 */
const TINT_OPACITY = 0.12

/** Resolves a callout tone to its accent colour from the live ramp. */
function toneAccent(colors: ColorRamp, tone: MobileCalloutTone): string {
  switch (tone) {
    case "success":
      return colors.success
    case "warning":
      return colors.warning
    case "destructive":
      return colors.destructive
    case "info":
    default:
      return colors.info
  }
}

export interface MobileCalloutProps {
  /**
   * Semantic tone driving the tint and the hairline border.
   */
  tone: MobileCalloutTone
  /**
   * Optional bold heading line.
   */
  title?: string
  /**
   * Body content. Plain strings are wrapped in `MobileText` automatically.
   */
  children?: React.ReactNode
  /**
   * Optional style override for the container.
   */
  style?: ViewStyle
}

/**
 * MobileCallout
 *
 * Inline rounded tone panel for notes inside a scrolling page — the quiet
 * sibling of `MobileBanner`: same tint-over-surface layering (RN cannot
 * mix colours, so the tone is a low-opacity stacked layer, never a computed
 * blend), but fully rounded, borderless of any accent edge, and with no
 * dismiss or action slots.
 */
export function MobileCallout({
  tone,
  title,
  children,
  style,
}: MobileCalloutProps) {
  const { colors } = useMobileTheme()
  const accent = toneAccent(colors, tone)

  return (
    <View
      style={[
        styles.callout,
        {
          backgroundColor: colors.surface,
          borderRadius: metrics.radius.md,
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: accent,
            opacity: TINT_OPACITY,
            borderRadius: metrics.radius.md,
          },
        ]}
      />

      {/* The accent dot replaces the banner's edge — a small full-strength
          tone marker that survives the diluted tint. */}
      <View style={[styles.dot, { backgroundColor: accent }]} />

      <View style={styles.body}>
        {title ? (
          <MobileText
            variant="callout"
            style={{ color: colors.foreground, fontWeight: "600" }}
          >
            {title}
          </MobileText>
        ) : null}
        {children ? (
          isTextChildren(children) ? (
            <MobileText
              variant="callout"
              style={{ color: colors.foreground, fontWeight: "400" }}
            >
              {children}
            </MobileText>
          ) : (
            children
          )
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  callout: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    overflow: "hidden",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: metrics.radius.full,
    // Optically centred against the first line of 18pt-leading text.
    marginTop: 5,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    gap: 2,
  },
})
