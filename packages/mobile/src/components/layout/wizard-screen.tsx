import * as React from "react"
import { StyleSheet, View } from "react-native"
import { MobileButton } from "../primitive/button"
import { MobileToolbar } from "../primitive/toolbar"
import { MobileWizardStepper } from "../composite/wizard-stepper"
import { MobileScreen, type MobileScreenProps } from "./screen"

export interface MobileWizardScreenProps
  extends Omit<
    MobileScreenProps,
    "children" | "footer" | "scroll" | "contentContainerStyle"
  > {
  /** Step labels, in order. */
  steps: string[]
  /** Zero-based index of the visible step. */
  current: number
  /** Renders and enables the Back action. Omit on the first step's caller side or let it disable itself. */
  onBack?: () => void
  /** Advances the flow. Called on the last step too — the caller decides what "finish" does. */
  onNext?: () => void
  /** @default 'Back' */
  backLabel?: string
  /** Defaults to "Finish" on the last step, "Next" otherwise. */
  nextLabel?: string
  /** Marks the current step as the last one, which changes the default next label. */
  isLastStep?: boolean
  /** Disables both actions, e.g. while a step validates or submits. */
  busy?: boolean
  /** The step's content. */
  children: React.ReactNode
}

/**
 * MobileWizardScreen
 *
 * Multi-step flow frame: progress stepper on top, the caller's step content in
 * the middle, Back/Next actions pinned to the bottom.
 *
 * The actions live in `MobileScreen`'s pinned footer slot — inside a
 * `MobileToolbar`, so they read as a control shelf attached to the screen edge.
 * A Next button that scrolls away mid-form is a Next button the user has to go
 * looking for.
 *
 * Back is a ghost button and Next is the outlined default, matching the design
 * system's weight order: the destructive-to-progress action stays quiet and the
 * advancing action carries the chrome. Back disables itself on the first step
 * rather than disappearing, so the control layout never shifts between steps.
 */
export function MobileWizardScreen({
  steps,
  current,
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel,
  isLastStep = false,
  busy = false,
  children,
  ...screenProps
}: MobileWizardScreenProps) {
  const resolvedNextLabel = nextLabel ?? (isLastStep ? "Finish" : "Next")
  const onFirstStep = current <= 0

  return (
    <MobileScreen
      {...screenProps}
      scroll
      footerBordered={false}
      contentContainerStyle={styles.content}
      footer={
        <MobileToolbar>
          <MobileButton
            variant="ghost"
            onPress={onBack}
            disabled={busy || onFirstStep || !onBack}
            containerStyle={styles.action}
            accessibilityHint="Returns to the previous step"
          >
            {backLabel}
          </MobileButton>
          <MobileButton
            variant="default"
            onPress={onNext}
            disabled={busy || !onNext}
            containerStyle={styles.action}
            accessibilityHint={
              isLastStep ? "Completes the flow" : "Advances to the next step"
            }
          >
            {busy ? `${resolvedNextLabel}…` : resolvedNextLabel}
          </MobileButton>
        </MobileToolbar>
      }
    >
      <MobileWizardStepper steps={steps} current={current} />
      <View style={styles.stepContent}>{children}</View>
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  stepContent: {
    flex: 1,
    marginTop: 24,
  },
  // Both actions share the shelf equally; neither crowds out the other when
  // one label is longer.
  action: {
    flex: 1,
  },
})
