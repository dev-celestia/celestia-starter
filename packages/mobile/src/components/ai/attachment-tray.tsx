import * as React from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight } from "../../utils"
import { MobileText } from "../primitive/text"

export type MobileAiAttachmentKind = "image" | "file" | "audio" | "link"

export interface MobileAiAttachment {
  /** Stable key, passed back to `onRemove`. */
  id: string
  /** Display name, e.g. "quarterly-report.pdf". */
  name: string
  /** Drives the drawn kind glyph. @default 'file' */
  kind?: MobileAiAttachmentKind
  /** Human-readable size, e.g. "1.2 MB". */
  size?: string
  /** Optional thumbnail node, e.g. a `<Image>` for an image attachment. */
  thumbnail?: React.ReactNode
}

export interface MobileAttachmentTrayProps {
  /**
   * Pending attachments, in the order they were added.
   */
  attachments: MobileAiAttachment[]
  /**
   * Fires with the removed id. Omit to render the tray read-only.
   */
  onRemove?: (id: string) => void
  /**
   * Optional heading above the row, e.g. "3 attachments".
   */
  title?: string
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const KIND_GLYPH: Record<MobileAiAttachmentKind, string> = {
  image: "\u25A3",
  file: "\u25A4",
  audio: "\u266A",
  link: "\u2197",
}

/**
 * MobileAttachmentTray
 *
 * The strip of pending attachments above a prompt composer.
 *
 * It scrolls horizontally rather than wrapping: a wrap would reflow the composer
 * upward with every added file, and on a phone the keyboard is already taking
 * half the screen. Fixed-height chips keep the composer's height stable no
 * matter how many files are queued.
 *
 * Each chip names its own kind with a drawn glyph, so an attachment is never
 * identified by thumbnail alone — thumbnails are frequently blank, and a blank
 * square tells the user nothing.
 */
export function MobileAttachmentTray({
  attachments,
  onRemove,
  title,
  style,
  testID,
}: MobileAttachmentTrayProps) {
  const { colors } = useMobileTheme()

  if (attachments.length === 0) return null

  return (
    <View testID={testID} style={[styles.tray, style]}>
      {title ? (
        <MobileText variant="label" color="muted" style={styles.title}>
          {title}
        </MobileText>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {attachments.map((attachment) => {
          const kind = attachment.kind ?? "file"

          return (
            <View
              key={attachment.id}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.cardBorder,
                  borderRadius: metrics.radius.md,
                },
              ]}
            >
              <View
                style={[
                  styles.thumb,
                  {
                    backgroundColor: colors.mutedBackground,
                    borderRadius: metrics.radius.sm,
                  },
                ]}
              >
                {attachment.thumbnail ?? (
                  <MobileText variant="callout" color="muted">
                    {KIND_GLYPH[kind]}
                  </MobileText>
                )}
              </View>

              <View style={styles.meta}>
                <MobileText
                  variant="caption"
                  numberOfLines={1}
                  style={styles.name}
                >
                  {attachment.name}
                </MobileText>
                {attachment.size ? (
                  <MobileText
                    variant="caption"
                    color="muted"
                    tabular
                    numberOfLines={1}
                  >
                    {attachment.size}
                  </MobileText>
                ) : null}
              </View>

              {onRemove ? (
                <Pressable
                  onPress={() => {
                    hapticLight()
                    onRemove(attachment.id)
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${attachment.name}`}
                  hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
                  style={styles.remove}
                >
                  <MobileText
                    variant="caption"
                    color="muted"
                    style={styles.removeGlyph}
                  >
                    {"\u2715"}
                  </MobileText>
                </Pressable>
              ) : null}
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  tray: {
    gap: 6,
  },
  title: {
    letterSpacing: 0.6,
  },
  scrollContent: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 6,
    paddingRight: 8,
    paddingVertical: 6,
    borderWidth: 1,
    // The chip is a fixed 56pt tall so the composer never reflows.
    minHeight: 56,
  },
  thumb: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  meta: {
    maxWidth: 132,
    gap: 1,
  },
  name: {
    fontWeight: "500",
  },
  remove: {
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 2,
  },
  removeGlyph: {
    fontWeight: "600",
  },
})
