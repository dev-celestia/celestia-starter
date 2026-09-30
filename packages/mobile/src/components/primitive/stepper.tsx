import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native"
import { useMobileTheme } from "../../host"
import { usePressSpring } from "../../motion"
import { metrics } from "../../tokens"
import { clamp, hapticSelect, hitSlopFor } from "../../utils"
import { MobileText } from "./text"

/** Visible button height; `hitSlopFor` closes the gap to 44pt. */
const BUTTON_SIZE = 36

export interface MobileStepperProps {
  /**
   * Current value. Controlled — the parent owns the state.
   */
  value: number
  /**
   * Called with the clamped next value after a tap on − or +.
   */
  onChange: (v: number) => void
  /**
   * Lower bound; − disables at it. Unbounded when omitted.
   */
  min?: number
  /**
   * Upper bound; + disables at it. Unbounded when omitted.
   */
  max?: number
  /**
   * Increment per tap.
   * @default 1
   */
  step?: number
  /**
   * Disables both buttons and greys the row out.
   * @default false
   */
  disabled?: boolean
}

/** Decimal places of `step`, so 0.1-steps never show float dust. */
function decimalsOf(step: number): number {
  if (!Number.isFinite(step)) return 0
  const parts = String(Math.abs(step)).split(".")
  return parts[1]?.length ?? 0
}

/**
 * MobileStepper
 *
 * − value + quantity row. The value renders in `MobileText` with tabular
 * numerals so digits do not jitter mid-press, and each committed step fires a
 * selection tick — a value change is a selection-class event in the house
 * haptic vocabulary.
 *
 * Steps are rounded to the step's own decimal precision before clamping;
 * `0.1 + 0.2` must land on `0.3`, not on IEEE-754 dust. Buttons disable
 * exactly at the bounds and skip their press feedback when they do.
 */
export function MobileStepper({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled = false,
}: MobileStepperProps) {
  const { colors } = useMobileTheme()

  const atMin = value <= min
  const atMax = value >= max

  const commit = (direction: 1 | -1) => {
    const decimals = decimalsOf(step)
    const next = Number((value + direction * step).toFixed(decimals))
    const clamped = clamp(next, min, max)
    if (clamped === value) return
    hapticSelect()
    onChange(clamped)
  }

  return (
    <View
      style={[
        styles.row,
        {
          borderColor: colors.inputBorder,
          backgroundColor: colors.surface,
          borderRadius: metrics.radius.md,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <StepButton
        glyph="−"
        accessibilityLabel="Decrease"
        disabled={disabled || atMin}
        onPress={() => commit(-1)}
      />

      <View style={styles.valueBox} accessibilityRole="text" accessibilityLabel={`Value ${value}`}>
        <MobileText variant="bodyMedium" tabular align="center">
          {String(value)}
        </MobileText>
      </View>

      <StepButton
        glyph="+"
        accessibilityLabel="Increase"
        disabled={disabled || atMax}
        onPress={() => commit(1)}
      />
    </View>
  )
}

interface StepButtonProps {
  glyph: string
  accessibilityLabel: string
  disabled: boolean
  onPress: () => void
}

function StepButton({
  glyph,
  accessibilityLabel,
  disabled,
  onPress,
}: StepButtonProps) {
  const { colors } = useMobileTheme()
  // Press feedback: dip on press-in, spring back on release. The hook's
  // handlers need no disabled guard — a disabled Pressable never emits press
  // events, so a button at its bound never animates.
  const { value: pressAnim, onPressIn, onPressOut } = usePressSpring(1, 0.9)

  const slop = hitSlopFor(BUTTON_SIZE)

  return (
    <Pressable
      onPress={() => {
        if (disabled) return
        onPress()
      }}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      hitSlop={{ top: slop, bottom: slop, left: 0, right: 0 }}
    >
      <Animated.View
        style={[
          styles.button,
          { opacity: disabled ? 0.4 : 1, transform: [{ scale: pressAnim }] },
        ]}
      >
        <MobileText
          variant="title"
          style={{ color: colors.foreground, fontSize: 20, lineHeight: 24 }}
        >
          {glyph}
        </MobileText>
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: 1,
    paddingHorizontal: 4,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  valueBox: {
    minWidth: 44,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
})
