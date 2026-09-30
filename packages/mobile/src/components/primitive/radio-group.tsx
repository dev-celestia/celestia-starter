import * as React from "react"
import {
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
  Animated,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { SPRING_SNAPPY, springTo } from "../../motion"
import { MobileText } from "./text"
import { metrics } from "../../tokens"

export interface MobileRadioOption {
  /**
   * Value reported through `onValueChange` when this option is picked.
   */
  value: string
  /**
   * Primary option text.
   */
  label: string
  /**
   * Optional secondary line.
   */
  description?: string
  /**
   * Disables this option only.
   */
  disabled?: boolean
}

export interface MobileRadioGroupProps {
  /**
   * Selectable options, rendered in order.
   */
  options: MobileRadioOption[]
  /**
   * Currently selected value. Leave undefined for an unselected group.
   */
  value?: string
  /**
   * Called with the newly selected value.
   */
  onValueChange?: (value: string) => void
  /**
   * Disables every option.
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

/**
 * MobileRadioGroup
 *
 * Single-select list. The whole row is the touch target (44pt floor) and each
 * row carries `accessibilityRole="radio"` inside a `radiogroup`, so a screen
 * reader announces the set, the position and the selection correctly.
 *
 * Selection haptics fire on the causal commit frame, and only when the value
 * actually changes — re-tapping the current option stays silent.
 *
 * Animation: the inner selected dot scales/fades in with an `Animated.spring`
 * when the option is selected and springs back out on deselection (see
 * `RadioDot`); disabled options skip the animation.
 */
export function MobileRadioGroup({
  options,
  value,
  onValueChange,
  disabled = false,
  style,
  testID,
}: MobileRadioGroupProps) {
  const { colors } = useMobileTheme()

  const handleSelect = (next: string) => {
    if (disabled || next === value) return
    Haptics.selectionAsync().catch(() => {})
    onValueChange?.(next)
  }

  return (
    <View
      accessibilityRole="radiogroup"
      testID={testID}
      style={[styles.group, style]}
    >
      {options.map((option) => {
        const isDisabled = disabled || option.disabled === true
        const isSelected = option.value === value

        return (
          <Pressable
            key={option.value}
            onPress={() => handleSelect(option.value)}
            disabled={isDisabled}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
            style={[styles.row, { opacity: isDisabled ? 0.45 : 1 }]}
          >
            <View
              style={[
                styles.radio,
                {
                  borderColor: isSelected ? colors.primary : colors.inputBorder,
                },
              ]}
            >
              <RadioDot selected={isSelected} disabled={isDisabled} />
            </View>

            <View style={styles.textContainer}>
              <MobileText variant="body">{option.label}</MobileText>
              {option.description ? (
                <MobileText
                  variant="caption"
                  color="muted"
                  style={styles.description}
                >
                  {option.description}
                </MobileText>
              ) : null}
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}

/**
 * The inner selected dot. Scales and fades in with a spring on selection and
 * springs back out on deselection; when disabled it snaps instead of animating.
 */
function RadioDot({
  selected,
  disabled,
}: {
  selected: boolean
  disabled: boolean
}) {
  const { colors } = useMobileTheme()
  const dotAnim = React.useRef(new Animated.Value(selected ? 1 : 0)).current

  React.useEffect(() => {
    if (disabled) {
      dotAnim.setValue(selected ? 1 : 0)
      return
    }
    springTo(dotAnim, selected ? 1 : 0, SPRING_SNAPPY).start()
  }, [selected, disabled, dotAnim])

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.radioDot,
        {
          backgroundColor: colors.primary,
          opacity: dotAnim,
          transform: [{ scale: dotAnim }],
        },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  group: {
    width: "100%",
  },
  row: {
    minHeight: metrics.minTouchTarget,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    marginTop: 2,
  },
})
