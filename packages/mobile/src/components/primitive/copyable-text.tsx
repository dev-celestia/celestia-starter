import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native"
import { useMobileTheme } from "../../host"
import { hapticLight, hitSlopFor } from "../../utils"
import { springTo, SPRING_SNAPPY } from "../../motion"
import { MobileText } from "./text"

export interface MobileCopyableTextProps {
  /**
   * Text to display. The consumer passes the same (or a derived) string to
   * whatever clipboard call it wires into `onCopy`.
   */
  text: string
  /**
   * Fired when the Copy affordance is tapped.
   *
   * Deliberate split: this component provides the *interaction* — affordance,
   * haptic, pop feedback — but performs no clipboard write, because a
   * presentational library should not own a platform dependency like
   * `expo-clipboard`. Consumers wire the copy themselves, e.g.
   * `onCopy={() => Clipboard.setStringAsync(text)}`.
   */
  onCopy?: () => void
}

/**
 * MobileCopyableText
 *
 * Read-only text plus a small "Copy" affordance. Tapping Copy fires a light
 * haptic, springs the affordance through a 1 → 1.15 → 1 pop so the commit is
 * visible without stealing layout space, then calls `onCopy`.
 */
export function MobileCopyableText({ text, onCopy }: MobileCopyableTextProps) {
  const { colors } = useMobileTheme()
  const pop = React.useRef(new Animated.Value(1)).current

  const handleCopy = () => {
    if (!onCopy) return
    hapticLight()

    const anim = Animated.sequence([
      springTo(pop, 1.15, SPRING_SNAPPY),
      springTo(pop, 1, SPRING_SNAPPY),
    ])
    anim.start()

    onCopy()
  }

  // Stop the pop animation if the row unmounts mid-sequence.
  React.useEffect(() => () => pop.stopAnimation(), [pop])

  return (
    <View style={styles.row}>
      <MobileText variant="body" selectable style={styles.text}>
        {text}
      </MobileText>

      {onCopy ? (
        <Animated.View style={{ transform: [{ scale: pop }] }}>
          <Pressable
            onPress={handleCopy}
            accessibilityRole="button"
            accessibilityLabel="Copy text"
            hitSlop={hitSlopFor(20)}
            style={styles.copyButton}
          >
            <MobileText
              variant="callout"
              style={{ color: colors.primary, fontWeight: "600" }}
            >
              Copy
            </MobileText>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  text: {
    flexShrink: 1,
  },
  copyButton: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
})
