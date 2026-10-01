import * as React from "react"
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight, hitSlopFor } from "../../utils"
import { MobileText } from "../primitive/text"
import { MobileSkeleton } from "../primitive/skeleton"
import { MobileSpinner } from "../primitive/spinner"

export type MobileImageResultStatus = "loading" | "ready" | "error"

export interface MobileImageResultCardProps {
  /**
   * The generated image. Ignored while `status` is `loading` or `error`.
   */
  source?: ImageSourcePropType
  /**
   * The prompt that produced it, shown as a caption under the image.
   */
  prompt?: string
  /**
   * Generation state.
   * @default 'ready'
   */
  status?: MobileImageResultStatus
  /**
   * Width-to-height ratio of the frame.
   * @default 1
   */
  aspectRatio?: number
  /**
   * Fires when the image itself is tapped — typically to open a lightbox.
   */
  onPress?: () => void
  /**
   * Fires from the download action. Omit to hide it.
   */
  onDownload?: () => void
  /**
   * Fires from the regenerate action. Omit to hide it.
   */
  onRegenerate?: () => void
  /**
   * Extra actions rendered beside the built-in ones.
   */
  actions?: React.ReactNode
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const ACTION_SIZE = 32

/**
 * MobileImageResultCard
 *
 * A generated image with its prompt and its actions.
 *
 * The frame **reserves its aspect ratio before the image resolves**, so a
 * gallery does not reflow when the first result lands. That is also why the
 * loading state is a skeleton in the same box rather than a spinner on a blank
 * canvas.
 *
 * Actions are drawn over a translucent scrim at the foot of the image instead of
 * sitting in a separate row: an image result is one object, and splitting its
 * controls into a bar underneath makes it read as two.
 */
export function MobileImageResultCard({
  source,
  prompt,
  status = "ready",
  aspectRatio = 1,
  onPress,
  onDownload,
  onRegenerate,
  actions,
  style,
  testID,
}: MobileImageResultCardProps) {
  const { colors } = useMobileTheme()

  const ratio = aspectRatio > 0 ? aspectRatio : 1
  const slop = hitSlopFor(ACTION_SIZE)
  const hasActions =
    onDownload != null || onRegenerate != null || actions != null

  const frame = (
    <View
      style={[
        styles.frame,
        {
          aspectRatio: ratio,
          backgroundColor: colors.mutedBackground,
          borderColor: colors.cardBorder,
          borderRadius: metrics.radius.md,
        },
      ]}
    >
      {status === "ready" && source ? (
        <Image source={source} resizeMode="cover" style={styles.image} />
      ) : status === "error" ? (
        <View style={styles.center}>
          <MobileText
            variant="callout"
            style={{ color: colors.destructive, fontWeight: "700" }}
          >
            !
          </MobileText>
          <MobileText variant="caption" color="muted">
            Generation failed
          </MobileText>
        </View>
      ) : (
        <>
          <MobileSkeleton
            width="100%"
            height={0}
            radius={metrics.radius.md}
            style={styles.fill}
          />
          <View style={styles.center} pointerEvents="none">
            <MobileSpinner size="small" color={colors.primary} />
          </View>
        </>
      )}

      {status === "ready" && hasActions ? (
        <View style={styles.overlay}>
          <View style={styles.overlayActions}>
            {actions}
            {onDownload ? (
              <Pressable
                onPress={() => {
                  hapticLight()
                  onDownload()
                }}
                accessibilityRole="button"
                accessibilityLabel="Download image"
                hitSlop={{ top: slop, bottom: slop }}
                style={[
                  styles.action,
                  {
                    width: ACTION_SIZE,
                    height: ACTION_SIZE,
                    borderRadius: metrics.radius.sm,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <MobileText variant="callout" color="muted">
                  {"\u2193"}
                </MobileText>
              </Pressable>
            ) : null}

            {onRegenerate ? (
              <Pressable
                onPress={() => {
                  hapticLight()
                  onRegenerate()
                }}
                accessibilityRole="button"
                accessibilityLabel="Regenerate image"
                hitSlop={{ top: slop, bottom: slop }}
                style={[
                  styles.action,
                  {
                    width: ACTION_SIZE,
                    height: ACTION_SIZE,
                    borderRadius: metrics.radius.sm,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <MobileText variant="callout" color="muted">
                  {"\u21BB"}
                </MobileText>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  )

  return (
    <View testID={testID} style={[styles.card, style]}>
      {onPress && status === "ready" ? (
        <Pressable
          onPress={() => {
            hapticLight()
            onPress()
          }}
          accessibilityRole="imagebutton"
          accessibilityLabel={
            prompt ? `Generated image: ${prompt}` : "Generated image"
          }
        >
          {frame}
        </Pressable>
      ) : (
        frame
      )}

      {prompt ? (
        <MobileText
          variant="caption"
          color="muted"
          numberOfLines={2}
          style={styles.prompt}
        >
          {prompt}
        </MobileText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
  },
  frame: {
    width: "100%",
    borderWidth: 1,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  // `flex: 1` lets the placeholder fill the aspect-ratio frame without the
  // skeleton needing a percentage height, which its props do not accept.
  fill: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 8,
    alignItems: "flex-end",
  },
  overlayActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  action: {
    alignItems: "center",
    justifyContent: "center",
    // Opaque with a hairline border rather than a scrim: the button must stay
    // legible over an arbitrary photo without introducing a blend colour the
    // theme ramp does not have.
    borderWidth: 1,
  },
  prompt: {
    lineHeight: 16,
  },
})
