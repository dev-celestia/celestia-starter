import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { clamp, formatCompactNumber } from "../../utils"
import type { ColorRamp } from "../../tokens"
import { MobileText } from "../primitive/text"
import { MobileProgress } from "../primitive/progress"

export interface MobileTokenMeterProps {
  /**
   * Tokens consumed by the conversation so far.
   */
  used: number
  /**
   * The model's context window, in tokens.
   */
  limit: number
  /**
   * Caption above the bar.
   * @default 'Context'
   */
  label?: string
  /**
   * Renders the "used / limit" readout beside the label.
   * @default true
   */
  showNumbers?: boolean
  /**
   * Fraction at which the bar turns to the warning tone.
   * @default 0.8
   */
  warnAt?: number
  /**
   * Fraction at which the bar turns to the destructive tone.
   * @default 0.95
   */
  dangerAt?: number
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
 * MobileTokenMeter
 *
 * How full the context window is.
 *
 * The tone escalates in two steps rather than one: amber warns that the
 * conversation is getting long, red means the next turn may be truncated. A
 * single threshold would either cry wolf or warn too late.
 *
 * The steps have to read as monotonically worse, which is why the resting tone
 * is the neutral `muted` rather than `primary`. This brand's primary and its
 * destructive are the *same hue* — measured in OKLCH, `primary` is
 * `oklch(0.5502 0.19 27.0)` and `destructive` is `oklch(0.4437 0.15 26.9)`, i.e.
 * 0.1° apart. They differ only in lightness, so resting on `primary` would run
 * red → amber → red and crossing the warn threshold would look like an
 * *improvement*. Slate → amber → red cannot be misread.
 *
 * That same measurement is why `destructive` cannot be lightened back toward
 * `warning`: the two would land on the same OKLCH lightness and the second step
 * would vanish. `scripts/ui-audit/mobile-contrast.mjs` asserts the step.
 *
 * The readout uses `formatCompactNumber` and tabular numerals so "12.4K / 128K"
 * does not jitter as it counts up.
 *
 * Exposed as a progressbar with a full accessible value, so the ratio is
 * announced as a number rather than as a percentage of an unnamed thing.
 */
export function MobileTokenMeter({
  used,
  limit,
  label = "Context",
  showNumbers = true,
  warnAt = 0.8,
  dangerAt = 0.95,
  style,
  testID,
}: MobileTokenMeterProps) {
  const safeLimit = limit > 0 ? limit : 1
  const ratio = clamp(used / safeLimit, 0, 1)

  // Hand `MobileProgress` a token *name* rather than a resolved colour: that is
  // what its `color` prop is for, and it keeps the meter reacting to the ramp.
  const tone: keyof ColorRamp =
    ratio >= dangerAt ? "destructive" : ratio >= warnAt ? "warning" : "muted"

  const percent = Math.round(ratio * 100)

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${percent} percent used`}
      accessibilityValue={{
        min: 0,
        max: safeLimit,
        now: clamp(used, 0, safeLimit),
      }}
      style={[styles.container, style]}
    >
      <View style={styles.header}>
        <MobileText variant="caption" color="muted">
          {label}
        </MobileText>
        {showNumbers ? (
          <MobileText variant="caption" color="muted" tabular>
            {`${formatCompactNumber(used)} / ${formatCompactNumber(limit)}`}
          </MobileText>
        ) : null}
      </View>

      <MobileProgress value={ratio} color={tone} height={4} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
})
