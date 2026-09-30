import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { MobileText } from "../primitive/text"
import { useCountdown } from "../../hooks"

export interface MobileCountdownTimerProps {
  /**
   * Duration to count down from, in seconds. Counting starts on mount.
   */
  seconds: number
  /**
   * Fired once when the countdown reaches zero. Ref-guarded: a resend flow
   * that restarts the timer must not see a second, phantom completion.
   */
  onComplete?: () => void
  /**
   * Renders h/m/s captions under each unit instead of one HH:MM:SS line.
   * @default false
   */
  labels?: boolean
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

const pad2 = (n: number) => String(n).padStart(2, "0")

/**
 * MobileCountdownTimer
 *
 * HH:MM:SS countdown in tabular numerals — the digits are fixed-width so
 * the readout doesn't jiggle every second. `labels` swaps the colons for
 * h/m/s captions when the timer is a hero element (OTP resend, flash sale)
 * rather than an inline detail.
 */
export function MobileCountdownTimer({
  seconds,
  onComplete,
  labels = false,
  style,
}: MobileCountdownTimerProps) {
  const { remaining } = useCountdown(seconds)

  const fired = React.useRef(false)
  React.useEffect(() => {
    // `seconds > 0` guard: a timer mounted already-at-zero never ran, so it
    // has nothing to report as completed.
    if (seconds > 0 && remaining === 0 && !fired.current) {
      fired.current = true
      onComplete?.()
    }
  }, [remaining, seconds, onComplete])

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60

  const a11yLabel =
    remaining === 0
      ? "Time is up"
      : `${h} hours ${m} minutes ${s} seconds remaining`

  if (labels) {
    const units = [
      { value: pad2(h), caption: "h" },
      { value: pad2(m), caption: "m" },
      { value: pad2(s), caption: "s" },
    ]
    return (
      <View
        style={[styles.row, style]}
        accessibilityRole="timer"
        accessibilityLabel={a11yLabel}
      >
        {units.map((unit) => (
          <View key={unit.caption} style={styles.unit}>
            <MobileText variant="heading" tabular>
              {unit.value}
            </MobileText>
            <MobileText variant="label" color="muted">
              {unit.caption}
            </MobileText>
          </View>
        ))}
      </View>
    )
  }

  return (
    <MobileText
      variant="heading"
      tabular
      align="center"
      accessibilityRole="timer"
      accessibilityLabel={a11yLabel}
      style={style}
    >
      {`${pad2(h)}:${pad2(m)}:${pad2(s)}`}
    </MobileText>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  unit: {
    alignItems: "center",
    gap: 2,
  },
})
