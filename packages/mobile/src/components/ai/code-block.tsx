import * as React from "react"
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileText } from "../primitive/text"
import { MobileAiCopyButton } from "./copy-button"
import { mobileMonoFont } from "./mono"

export interface MobileCodeBlockProps {
  /**
   * The code. Rendered verbatim — this component does no highlighting, since
   * the package takes no syntax-highlighting dependency.
   */
  code: string
  /**
   * Language label shown in the header, e.g. "ts" or "json".
   */
  language?: string
  /**
   * Filename shown in place of the language label.
   */
  filename?: string
  /**
   * Fired by the copy affordance. The clipboard is the consumer's concern.
   */
  onCopy?: () => void
  /**
   * Collapses the body to this many lines, with a "+N more lines" footer.
   * Omit to render the full block.
   */
  maxLines?: number
  /**
   * Horizontal scroll for long lines.
   * @default true
   */
  scrollable?: boolean
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileCodeBlock
 *
 * A monospace output surface for model-generated code, JSON and shell.
 *
 * Two mobile-specific decisions:
 *
 * - **Long lines scroll horizontally** rather than wrapping. Wrapped code
 *   destroys indentation, and indentation is the only structure a
 *   non-highlighted block has left.
 * - **`maxLines` truncates instead of shrinking.** A 200-line answer would
 *   otherwise push the rest of the conversation off-screen; the footer names
 *   exactly how much is hidden, so the cut is never silent.
 */
export function MobileCodeBlock({
  code,
  language,
  filename,
  onCopy,
  maxLines,
  scrollable = true,
  style,
  testID,
}: MobileCodeBlockProps) {
  const { colors } = useMobileTheme()

  const lines = React.useMemo(() => code.replace(/\n$/, "").split("\n"), [code])
  const truncated = maxLines != null && lines.length > maxLines
  const visible = truncated ? lines.slice(0, maxLines) : lines
  const hidden = lines.length - visible.length

  const header = filename ?? language

  const body = (
    <View style={styles.codeBody}>
      {visible.map((line, index) => (
        <MobileText
          key={index}
          variant="caption"
          style={[styles.codeLine, { color: colors.foreground }]}
        >
          {line.length > 0 ? line : " "}
        </MobileText>
      ))}
      {truncated ? (
        <MobileText variant="caption" color="muted" style={styles.more}>
          {`+${hidden} more ${hidden === 1 ? "line" : "lines"}`}
        </MobileText>
      ) : null}
    </View>
  )

  return (
    <View
      testID={testID}
      style={[
        styles.block,
        {
          backgroundColor: colors.mutedBackground,
          borderColor: colors.cardBorder,
          borderRadius: metrics.radius.md,
        },
        style,
      ]}
    >
      {header || onCopy ? (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          {header ? (
            <MobileText
              variant="label"
              color="muted"
              style={styles.headerLabel}
            >
              {header}
            </MobileText>
          ) : (
            <View style={styles.headerLabel} />
          )}
          {onCopy ? <MobileAiCopyButton onCopy={onCopy} /> : null}
        </View>
      ) : null}

      {scrollable ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  block: {
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLabel: {
    flex: 1,
    letterSpacing: 0.6,
  },
  scrollContent: {
    flexGrow: 1,
  },
  codeBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  codeLine: {
    fontFamily: mobileMonoFont,
    fontSize: 12,
    lineHeight: 18,
  },
  more: {
    marginTop: 4,
    fontFamily: mobileMonoFont,
  },
})
