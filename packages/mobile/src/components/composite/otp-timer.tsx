import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { MobileText } from "../primitive/text"
import { MobileButton } from "../primitive/button"
import { useCountdown } from "../../hooks"

export interface MobileOtpTimerProps {
  /**
   * Countdown length in seconds.
   * @default 60
   */
  seconds?: number
  /**
   * Called when the resend affordance is pressed (only possible once the
   * countdown has finished).
   */
  onResend: () => void
  /**
   * Base copy. While running it reads "`{label} in 0:45`"; when done the
   * button reads exactly `{label}`.
   * @default 'Resend code'
   */
  label?: string
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/** `45` → `"0:45"`, `90` → `"1:30"`. */
function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, "0")
  return `${minutes}:${seconds}`
}

/**
 * MobileOtpTimer
 *
 * "Resend code in 0:45" countdown that turns into a pressable primary button
 * when it hits zero. Tabular numerals keep the ticking digits from jittering
 * the layout — a proportional "1" is narrower than "0", so the line would
 * wobble every second.
 *
 * **Restarting is the consumer's job.** The countdown starts on mount and
 * never rewinds on its own; after calling your resend API, remount with a new
 * `key` (e.g. `<MobileOtpTimer key={attemptCount} … />`) to run it again. That
 * keeps this component stateless with respect to the request lifecycle — it
 * cannot know whether the resend actually succeeded.
 */
export function MobileOtpTimer({
  seconds = 60,
  onResend,
  label = "Resend code",
  style,
  testID,
}: MobileOtpTimerProps) {
  const { remaining, isRunning } = useCountdown(seconds)

  if (isRunning) {
    return (
      <View testID={testID} style={[styles.container, style]}>
        <MobileText
          variant="callout"
          color="muted"
          tabular
          accessibilityLabel={`${label} in ${formatClock(remaining)}`}
        >
          {label} in {formatClock(remaining)}
        </MobileText>
      </View>
    )
  }

  return (
    <View testID={testID} style={[styles.container, style]}>
      <MobileButton variant="default" onPress={onResend}>
        {label}
      </MobileButton>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
})
