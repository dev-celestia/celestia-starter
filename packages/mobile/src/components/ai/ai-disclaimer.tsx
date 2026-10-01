import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileText } from "../primitive/text"

export interface MobileAiDisclaimerProps {
  /**
   * Notice text.
   * @default 'AI can make mistakes. Check important information.'
   */
  text?: string
  /**
   * `warning` adds the caution tint for surfaces where accuracy is critical —
   * health, finance, legal.
   * @default 'muted'
   */
  tone?: "muted" | "warning"
  /**
   * Renders a compact single-line variant without the marker glyph.
   * @default false
   */
  compact?: boolean
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const DEFAULT_TEXT = "AI can make mistakes. Check important information."

/**
 * MobileAiDisclaimer
 *
 * The standing "AI can make mistakes" notice.
 *
 * Deliberately quiet: it sits at the foot of a transcript and must be readable
 * without competing with the answer above it. The `warning` tone is available
 * for domains where a wrong answer has real cost, and `compact` drops the
 * marker glyph for placement under a composer where vertical space is tight.
 */
export function MobileAiDisclaimer({
  text = DEFAULT_TEXT,
  tone = "muted",
  compact = false,
  style,
  testID,
}: MobileAiDisclaimerProps) {
  const { colors } = useMobileTheme()
  const accent = tone === "warning" ? colors.warning : colors.muted

  return (
    <View
      testID={testID}
      style={[styles.row, compact ? styles.compactRow : null, style]}
    >
      {!compact ? (
        <View
          style={[
            styles.marker,
            { backgroundColor: accent, borderRadius: metrics.radius.full },
          ]}
        />
      ) : null}

      <MobileText
        variant="caption"
        color="muted"
        align={compact ? "center" : "left"}
        style={styles.text}
      >
        {text}
      </MobileText>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  compactRow: {
    justifyContent: "center",
  },
  marker: {
    width: 6,
    height: 6,
    // Optically centred against the first line of 16pt-leading caption text.
    marginTop: 5,
    flexShrink: 0,
  },
  text: {
    flex: 1,
  },
})
