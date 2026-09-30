import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type AccessibilityState,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { springTo, usePressSpring } from "../../motion"
import { metrics } from "../../tokens"
import { hapticLight, hitSlopFor } from "../../utils"
import { MobileText } from "./text"

/** Nominal pill height; `hitSlop` closes the gap to the 44pt floor. */
const CHIP_HEIGHT = 32

export interface MobileChipProps {
  /**
   * Chip caption.
   */
  label: string
  /**
   * Whether the chip is in the selected (primary-filled) state.
   * @default false
   */
  selected?: boolean
  /**
   * Called when the chip is pressed. Omit for a static, non-pressable chip.
   */
  onPress?: () => void
  /**
   * Whether the chip is disabled.
   * @default false
   */
  disabled?: boolean
  /**
   * Optional leading element. The chip cannot recolour arbitrary nodes, so
   * pass something that reads well on both the neutral and primary fills.
   */
  icon?: React.ReactNode
  /**
   * Optional style override for the pill surface.
   */
  style?: ViewStyle
  /**
   * Optional test ID for automation.
   */
  testID?: string
  /**
   * Extra screen-reader state (e.g. `checked` when used inside a
   * MobileToggleGroup). Merged with `disabled`.
   */
  accessibilityState?: AccessibilityState
}

/**
 * MobileChip
 *
 * Selectable pill. Selection crossfades to the primary fill via stacked
 * layers — the neutral pill sits underneath, the primary pill fades in on top,
 * and the label is duplicated the same way so its colour swaps without ever
 * interpolating colour strings.
 *
 * Pressing dips the pill to 0.96 scale on a short timing and springs back
 * on release; disabled chips skip the animation and sit at half opacity.
 */
export function MobileChip({
  label,
  selected = false,
  onPress,
  disabled = false,
  icon,
  style,
  testID,
  accessibilityState,
}: MobileChipProps) {
  const { colors } = useMobileTheme()
  const {
    value: pressAnim,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
  } = usePressSpring(1, 0.96)
  const selectAnim = React.useRef(new Animated.Value(selected ? 1 : 0)).current

  React.useEffect(() => {
    if (disabled) {
      // Snap instead of springing — a disabled control should not move.
      selectAnim.setValue(selected ? 1 : 0)
      return
    }
    springTo(selectAnim, selected ? 1 : 0).start()
  }, [selected, disabled, selectAnim])

  const handlePress = () => {
    if (disabled || !onPress) return
    hapticLight()
    onPress()
  }

  const slop = hitSlopFor(CHIP_HEIGHT)

  return (
    <Animated.View
      style={{
        opacity: disabled ? 0.5 : 1,
        transform: [{ scale: pressAnim }],
        alignSelf: "flex-start",
      }}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || !onPress}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected, disabled, ...accessibilityState }}
        hitSlop={{ top: slop, bottom: slop, left: 0, right: 0 }}
        style={[
          styles.pill,
          {
            backgroundColor: colors.secondary,
            borderColor: colors.inputBorder,
          },
          style,
        ]}
      >
        {/* Selected fill fades in over the neutral pill (inset -1 covers the
            border box, same trick as the input focus ring). */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.selectedLayer,
            {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
              opacity: selectAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolate: "clamp",
              }),
            },
          ]}
        />

        {icon ? <View style={styles.icon}>{icon}</View> : null}

        <View>
          <MobileText
            variant="callout"
            style={{ color: colors.secondaryForeground }}
          >
            {label}
          </MobileText>
          {/* Stacked duplicate crossfades the label to the on-primary colour. */}
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                justifyContent: "center",
                opacity: selectAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                  extrapolate: "clamp",
                }),
              },
            ]}
          >
            <MobileText variant="callout" style={{ color: colors.primaryForeground }}>
              {label}
            </MobileText>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  pill: {
    minHeight: CHIP_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: metrics.radius.full,
    borderWidth: 1,
  },
  selectedLayer: {
    position: "absolute",
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: metrics.radius.full,
    borderWidth: 1,
  },
  icon: {
    alignItems: "center",
    justifyContent: "center",
  },
})
