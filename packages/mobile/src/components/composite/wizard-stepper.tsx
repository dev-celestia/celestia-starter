import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { clamp } from "../../utils"

export interface MobileWizardStepperProps {
  /**
   * Step titles, in order.
   */
  steps: string[]
  /**
   * Index of the active step, 0-based. Steps before it are done, after it
   * are upcoming.
   */
  current: number
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

const CIRCLE = 30
const CONNECTOR = 2

/**
 * MobileWizardStepper
 *
 * Horizontal numbered circles joined by connector lines: done steps get a
 * filled primary circle with a drawn check, the active step a primary ring,
 * upcoming steps a muted outline. The active step's title is printed below —
 * numbered circles alone fit a phone, but circle *labels* do not.
 *
 * The check is two rotated borders, the same structural mark the checkbox
 * uses, so no icon dependency is introduced.
 */
export function MobileWizardStepper({
  steps,
  current,
  style,
}: MobileWizardStepperProps) {
  const { colors } = useMobileTheme()
  const activeIndex = clamp(current, 0, Math.max(0, steps.length - 1))
  const activeLabel = steps[activeIndex]

  return (
    <View style={[styles.container, style]}>
      <View style={styles.track} accessibilityRole="none">
        {steps.map((step, index) => {
          const done = index < activeIndex
          const active = index === activeIndex
          const state = done ? "complete" : active ? "current" : "upcoming"

          return (
            <React.Fragment key={`${step}-${index}`}>
              {index > 0 ? (
                <View
                  style={[
                    styles.connector,
                    {
                      // A connector leading into a finished step is primary,
                      // so the filled run reads as progress, not decoration.
                      backgroundColor: done || active ? colors.primary : colors.border,
                    },
                  ]}
                />
              ) : null}

              <View
                accessibilityRole="text"
                accessibilityLabel={`Step ${index + 1} of ${steps.length}: ${step}, ${state}`}
                style={[
                  styles.circle,
                  {
                    backgroundColor: done ? colors.primary : "transparent",
                    borderColor: done || active ? colors.primary : colors.border,
                    borderWidth: active ? 2 : 1,
                  },
                ]}
              >
                {done ? (
                  <View
                    style={[styles.check, { borderColor: colors.primaryForeground }]}
                  />
                ) : (
                  <MobileText
                    variant="caption"
                    tabular
                    style={{
                      color: active ? colors.primary : colors.muted,
                      fontWeight: active ? "700" : "600",
                    }}
                  >
                    {index + 1}
                  </MobileText>
                )}
              </View>
            </React.Fragment>
          )
        })}
      </View>

      {activeLabel ? (
        <MobileText variant="callout" align="center" numberOfLines={2}>
          {activeLabel}
        </MobileText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingVertical: 8,
  },
  track: {
    flexDirection: "row",
    alignItems: "center",
  },
  connector: {
    flex: 1,
    height: CONNECTOR,
    borderRadius: CONNECTOR / 2,
    marginHorizontal: 4,
  },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  check: {
    width: 6,
    height: 11,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "45deg" }],
    marginTop: -3,
  },
})
