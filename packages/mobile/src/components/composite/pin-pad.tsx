import * as React from "react"
import {
  Pressable,
  View,
  StyleSheet,
  Animated,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"
import { hapticLight } from "../../utils"
import { pressInTiming, springTo } from "../../motion"

export interface MobilePinPadProps {
  /**
   * Called with "0".."9" for each digit key.
   */
  onKeyPress: (key: string) => void
  /**
   * Called for the delete (⌫) key.
   */
  onDelete?: () => void
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * Grid order: 1–9, then an empty spacer cell, 0, and delete. The empty cell
 * keeps 0 under 8 (column 2) like a telephone keypad, rather than a
 * calculator's bottom-row shift.
 */
const KEYS: (string | null)[] = [
  "1", "2", "3",
  "4", "5", "6",
  "7", "8", "9",
  null, "0", "delete",
]

interface PadKeyProps {
  glyph: string
  accessibilityLabel: string
  disabled: boolean
  onPress: () => void
}

/**
 * One circular pad key with press-scale feedback: shrinks on touch, springs
 * back on release. Scale-only, so it runs on the native driver.
 */
function PadKey({ glyph, accessibilityLabel, disabled, onPress }: PadKeyProps) {
  const { colors } = useMobileTheme()
  const pressAnim = React.useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    if (disabled) return
    // Explicit 80ms: this dip is quicker than the 90ms press idiom.
    pressInTiming(pressAnim, 0.92, 80).start()
  }

  const handlePressOut = () => {
    if (disabled) return
    springTo(pressAnim, 1).start()
  }

  return (
    <View style={styles.cell}>
      <AnimatedPressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        style={[
          styles.key,
          {
            backgroundColor: colors.mutedBackground,
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale: pressAnim }],
          },
        ]}
      >
        <MobileText variant="title" tabular>
          {glyph}
        </MobileText>
      </AnimatedPressable>
    </View>
  )
}

/**
 * MobilePinPad
 *
 * 3-column numeric keypad (1–9, blank/0/⌫) for PIN and passcode entry.
 *
 * Presentational by design: it reports key events and holds no buffer, so the
 * consumer owns masking, length limits and submission. Each key fires a light
 * haptic on commit — a pad without key feedback feels broken even when it is
 * not. Keys are 64pt circles, comfortably above the 44pt floor.
 */
export function MobilePinPad({
  onKeyPress,
  onDelete,
  disabled = false,
  style,
  testID,
}: MobilePinPadProps) {
  return (
    <View testID={testID} style={[styles.grid, style]}>
      {KEYS.map((key, index) => {
        if (key === null) {
          // Spacer cell keeps the 3-column rhythm without rendering a key.
          return <View key={`spacer-${index}`} style={styles.cell} />
        }
        if (key === "delete") {
          return (
            <PadKey
              key="delete"
              glyph="⌫"
              accessibilityLabel="Delete"
              disabled={disabled}
              onPress={() => {
                hapticLight()
                onDelete?.()
              }}
            />
          )
        }
        return (
          <PadKey
            key={key}
            glyph={key}
            accessibilityLabel={`Digit ${key}`}
            disabled={disabled}
            onPress={() => {
              hapticLight()
              onKeyPress(key)
            }}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "33.333%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  key: {
    width: 64,
    height: 64,
    minWidth: metrics.minTouchTarget,
    minHeight: metrics.minTouchTarget,
    borderRadius: metrics.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
})
