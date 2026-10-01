import * as React from "react"
import { Pressable, StyleSheet, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { hapticLight, hitSlopFor } from "../../utils"
import { MobileText } from "../primitive/text"

export interface MobileAiCopyButtonProps {
  /**
   * Fired on commit. The clipboard itself is the consumer's concern — this
   * package takes no `expo-clipboard` dependency.
   */
  onCopy: () => void
  /**
   * Resting label.
   * @default 'Copy'
   */
  label?: string
  /**
   * Confirmation label shown for a moment after a copy.
   * @default 'Copied'
   */
  copiedLabel?: string
  /**
   * Visual size.
   * @default 'sm'
   */
  size?: "sm" | "md"
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const SIZE_MAP: Record<"sm" | "md", number> = { sm: 28, md: 34 }
/** How long the confirmation label stays up. */
const CONFIRM_MS = 1600

/**
 * MobileAiCopyButton
 *
 * The copy affordance shared by every AI output surface — code blocks, tool
 * results, whole answers.
 *
 * It owns only the *confirmation*, not the clipboard: `onCopy` is the
 * consumer's, which keeps `expo-clipboard` out of the package's dependency
 * graph. The confirmation is a timed label swap with a cleared timer on unmount,
 * so a button unmounted mid-confirmation cannot set state afterwards.
 *
 * The visual box is 28pt; `hitSlop` lifts it to the 44pt touch target, the same
 * split `MobileButton` uses.
 */
export function MobileAiCopyButton({
  onCopy,
  label = "Copy",
  copiedLabel = "Copied",
  size = "sm",
  style,
  testID,
}: MobileAiCopyButtonProps) {
  const { colors } = useMobileTheme()
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const handlePress = () => {
    hapticLight()
    onCopy()
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), CONFIRM_MS)
  }

  const dimension = SIZE_MAP[size]
  const slop = hitSlopFor(dimension)

  return (
    <Pressable
      onPress={handlePress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={copied ? copiedLabel : label}
      hitSlop={{ top: slop, bottom: slop, left: 4, right: 4 }}
      style={[
        styles.button,
        {
          minHeight: dimension,
          borderRadius: metrics.radius.sm,
          borderColor: copied ? colors.success : colors.border,
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      <MobileText
        variant="caption"
        color={copied ? colors.success : colors.muted}
        style={styles.label}
      >
        {copied ? copiedLabel : label}
      </MobileText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  label: {
    fontWeight: "600",
  },
})
