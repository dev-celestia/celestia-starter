import * as React from "react"
import { Pressable, StyleSheet, View } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics, type ColorRamp } from "../../tokens"
import { hapticLight, isTextChildren } from "../../utils"
import { MobileText } from "./text"

export type MobileBannerTone = "info" | "success" | "warning" | "destructive"

/**
 * Tint strength over the surface fill. Low enough that foreground text keeps
 * its contrast floor in both schemes — the tone lives in the strip's hue, not
 * in a saturated fill.
 */
const TINT_OPACITY = 0.12

/** Resolves a banner tone to its accent colour from the live ramp. */
function bannerAccent(colors: ColorRamp, tone: MobileBannerTone): string {
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

export interface MobileBannerProps {
  /**
   * Semantic tone driving the tint and the left accent edge.
   */
  tone: MobileBannerTone
  /**
   * Optional bold heading line.
   */
  title?: string
  /**
   * Body content. Plain strings are wrapped in `MobileText` automatically.
   */
  children?: React.ReactNode
  /**
   * Optional trailing action element (e.g. a MobileButton).
   */
  action?: React.ReactNode
  /**
   * When provided, renders an ✕ affordance that fires this callback.
   */
  onDismiss?: () => void
}

/**
 * MobileBanner
 *
 * Full-width tone-tinted strip for page-level messages. The tint is a
 * low-opacity layer of the tone colour stacked over the surface fill — RN has
 * no colour-mix, and a stacked layer keeps both values as real tokens instead
 * of hand-computed blends that would drift between schemes.
 *
 * A 3pt accent edge on the left carries the tone at full strength for glance
 * recognition (and for the ~8% of men who read hue differences weakly, it is
 * also a positional cue).
 */
export function MobileBanner({
  tone,
  title,
  children,
  action,
  onDismiss,
}: MobileBannerProps) {
  const { colors } = useMobileTheme()
  const accent = bannerAccent(colors, tone)

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.surface,
          borderLeftColor: accent,
          borderRadius: metrics.radius.md,
        },
      ]}
      accessibilityRole="alert"
    >
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: accent, opacity: TINT_OPACITY }]}
      />

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
            <MobileText variant="callout" style={{ color: colors.foreground, fontWeight: "400" }}>
              {children}
            </MobileText>
          ) : (
            children
          )
        ) : null}
      </View>

      {action ? <View style={styles.action}>{action}</View> : null}

      {onDismiss ? (
        <Pressable
          onPress={() => {
            hapticLight()
            onDismiss()
          }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss banner"
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          style={styles.dismiss}
        >
          <MobileText variant="caption" style={{ color: colors.muted, fontWeight: "600" }}>
            ✕
          </MobileText>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingRight: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    overflow: "hidden",
  },
  body: {
    flex: 1,
    gap: 2,
  },
  action: {
    flexShrink: 0,
  },
  dismiss: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
})
