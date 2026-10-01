import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileSkeleton } from "../primitive/skeleton"

export interface MobileAiSkeletonMessageProps {
  /**
   * Renders the avatar-shaped placeholder disc on the left.
   * @default true
   */
  avatar?: boolean
  /**
   * Number of placeholder text lines.
   * @default 3
   */
  lines?: number
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
 * Line widths as a fraction of the column. The last line is short on purpose —
 * a rectangle of equal lines reads as a table, a ragged tail reads as prose.
 */
const LINE_WIDTHS = ["92%", "100%", "84%", "96%", "70%"] as const

/**
 * MobileAiSkeletonMessage
 *
 * Placeholder for an assistant turn that has not produced its first token yet.
 *
 * It exists so a cold model swap or a slow first byte shows the *shape* of the
 * answer instead of a bare spinner: the layout does not jump when the real text
 * arrives, because the placeholder already occupies the same column.
 *
 * The whole block is hidden from assistive technology — `MobileTypingIndicator`
 * or the surrounding screen owns the spoken "responding" state, and a screen
 * reader should never read a list of empty boxes.
 */
export function MobileAiSkeletonMessage({
  avatar = true,
  lines = 3,
  style,
  testID,
}: MobileAiSkeletonMessageProps) {
  const { colors } = useMobileTheme()
  const count = Math.max(1, Math.min(lines, LINE_WIDTHS.length))

  return (
    <View
      testID={testID}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.row, style]}
    >
      {avatar ? (
        <MobileSkeleton
          width={32}
          height={32}
          radius={metrics.radius.full}
          style={styles.avatar}
        />
      ) : null}

      <View style={styles.column}>
        {Array.from({ length: count }, (_, index) => (
          <MobileSkeleton
            key={index}
            width={LINE_WIDTHS[index]}
            height={12}
            radius={metrics.radius.sm}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginVertical: 4,
  },
  avatar: {
    marginTop: 2,
  },
  column: {
    flex: 1,
    gap: 8,
    paddingTop: 2,
  },
})
