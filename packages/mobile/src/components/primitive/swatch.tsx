import * as React from "react"
import {
  Animated,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { MobilePressableScale } from "./pressable-scale"
import { metrics } from "../../tokens"
import { hapticSelect, hitSlopFor } from "../../utils"
import { springTo } from "../../motion"

/** Ring thickness around a selected swatch, in points. */
const RING_WIDTH = 2
/** Gap between the chip and its ring — kept constant so selection never shifts layout. */
const RING_GAP = 2

export interface MobileSwatchProps {
  /** The colour this swatch represents; painted as-is (any CSS colour string). */
  color: string
  /**
   * Draws a foreground-coloured ring around the chip and pops it with a
   * spring. The ring sits in a constant-size border slot, so selecting never
   * nudges neighbouring swatches.
   * @default false
   */
  selected?: boolean
  /** Called on press commit, after a selection haptic. */
  onPress?: () => void
  /**
   * Chip diameter in points.
   * @default 32
   */
  size?: number
  /** Screen-reader label; defaults to the colour string. */
  accessibilityLabel?: string
  style?: ViewStyle
}

/**
 * MobileSwatch
 *
 * Round colour-picking chip. Interactive swatches ride `MobilePressableScale`
 * for the press shrink and let it pad the touch area to 44pt; selection adds a
 * spring "pop" and a selection-tick haptic. A swatch without `onPress` renders
 * as a plain legend chip — no press chrome, no dimming.
 */
export function MobileSwatch({
  color,
  selected = false,
  onPress,
  size = 32,
  accessibilityLabel,
  style,
}: MobileSwatchProps) {
  const { colors } = useMobileTheme()
  const pop = React.useRef(new Animated.Value(1)).current
  const isFirstRender = React.useRef(true)

  React.useEffect(() => {
    // Skip the mount so an already-selected swatch doesn't pop on screen
    // entry; the pop marks the moment selection *changes*.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!selected) return
    pop.setValue(0.8)
    springTo(pop, 1).start()
  }, [selected, pop])

  const chip = (
    <Animated.View
      style={{ transform: [{ scale: pop }] }}
      // Ring + gap live in a constant-size transparent border so the chip's
      // footprint is identical selected or not.
    >
      <View
        style={[
          styles.ring,
          {
            width: size + (RING_GAP + RING_WIDTH) * 2,
            height: size + (RING_GAP + RING_WIDTH) * 2,
            padding: RING_GAP,
            borderColor: selected ? colors.foreground : "transparent",
            borderWidth: RING_WIDTH,
          },
        ]}
      >
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </Animated.View>
  )

  if (!onPress) {
    return (
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel ?? color}
        style={style}
      >
        {chip}
      </View>
    )
  }

  const handlePress = () => {
    hapticSelect()
    onPress()
  }

  return (
    <MobilePressableScale
      onPress={handlePress}
      accessibilityLabel={accessibilityLabel ?? color}
      hitSlop={hitSlopFor(size)}
      style={style}
    >
      {chip}
    </MobilePressableScale>
  )
}

const styles = StyleSheet.create({
  ring: {
    borderRadius: metrics.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
})
