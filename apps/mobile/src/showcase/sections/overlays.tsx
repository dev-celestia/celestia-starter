import * as React from "react"
import { View } from "react-native"
import {
  MobileAccordion,
  MobileActionSheet,
  MobileAlert,
  MobileBottomSheet,
  MobileButton,
  MobileCollapsible,
  MobileConfirmDialog,
  MobileErrorBoundary,
  MobileFaqItem,
  MobileModal,
  MobileOfflineBanner,
  MobileText,
  MobileTextInput,
  MobileTooltip,
  useMobileToast,
  type MobileAccordionItem,
  type MobileActionSheetAction,
} from "@celestia-project/mobile"
import type { ShowcaseContext } from "../types"
import { STATUS_TONES } from "../sample-data"
import { Readout, Row, SPACE, Spacer, Specimen, Stack } from "../ui"

/**
 * Overlays — the modules that interrupt, plus the ones that merely hide.
 *
 * `alert`, `toast`, `bottom-sheet`, `action-sheet`, `confirm-dialog`, `modal`,
 * and the disclosure family — `accordion`, `collapsible`, `faq-item` — with
 * `tooltip`, `offline-banner` and `error-boundary` for the transient states.
 *
 * There are three genuinely different interruption levels here and they are not
 * interchangeable:
 *
 * - **Alert** is *inline*. It sits in the flow of the page and does not steal
 *   focus, so it is right for a validation summary or a plan warning.
 * - **Toast** is *transient*. It reports an outcome the user just caused, and
 *   auto-dismisses.
 * - **Sheet / action sheet / confirm dialog / modal** are *modal*. They block,
 *   so they are only for a decision the user must make before continuing.
 *
 * Disclosure (accordion, collapsible, FAQ) is the opposite of an overlay: it
 * hides content the user can choose to reveal, without ever blocking anything.
 * Reaching for a modal when an inline alert — or a disclosure — would do is
 * the most common way a mobile app ends up feeling hostile.
 */

const SHIPPING_ITEMS: MobileAccordionItem[] = [
  {
    id: "standard",
    title: "Standard — free",
    content: (
      <MobileText variant="callout">
        3–5 business days, tracked end to end.
      </MobileText>
    ),
  },
  {
    id: "express",
    title: "Express — $12",
    content: (
      <MobileText variant="callout">
        Next business day when ordered before 2pm.
      </MobileText>
    ),
  },
  {
    id: "pickup",
    title: "Store pickup — free",
    content: (
      <MobileText variant="callout">
        Ready within two hours at any store; hold for 48 hours.
      </MobileText>
    ),
  },
]

const FAQS = [
  {
    question: "How do I reset my password?",
    answer:
      "Settings → Security → Reset password. The link in the email expires after 30 minutes.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes — upgrades apply immediately and downgrades take effect at the end of the billing period.",
  },
  {
    question: "Do you offer student discounts?",
    answer:
      "Verified students get 50% off Pro. Sign in with a university email to see the offer.",
  },
]

/**
 * The doomed child of the error-boundary demo. Throwing during render is the
 * only thing a boundary can catch, so the flag has to flip a render, not an
 * effect.
 */
function GuardedWidget({ exploded }: { exploded: boolean }) {
  if (exploded) {
    throw new Error("Demo crash — thrown during render, on purpose.")
  }
  return (
    <MobileText variant="callout">
      This subtree renders fine. Press “Break me” to throw during render and
      watch the boundary catch it.
    </MobileText>
  )
}

export function OverlaysSection({ ctx }: { ctx: ShowcaseContext }) {
  const toast = useMobileToast()
  const [dismissedAlert, setDismissedAlert] = React.useState(false)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [actionSheetOpen, setActionSheetOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [confirmLoading, setConfirmLoading] = React.useState(false)
  const [lastEvent, setLastEvent] = React.useState("—")
  const [projectName, setProjectName] = React.useState("atlas")
  const [modalOpen, setModalOpen] = React.useState(false)
  const [detailsOpen, setDetailsOpen] = React.useState(false)
  const [bannerVisible, setBannerVisible] = React.useState(true)
  const [exploded, setExploded] = React.useState(false)

  const PROJECT_ACTIONS: MobileActionSheetAction[] = [
    {
      key: "rename",
      label: "Rename project",
      onPress: () => setLastEvent("rename"),
    },
    {
      key: "duplicate",
      label: "Duplicate",
      onPress: () => setLastEvent("duplicate"),
    },
    {
      key: "archive",
      label: "Archive",
      disabled: true,
      onPress: () => setLastEvent("should never fire"),
    },
    {
      key: "delete",
      label: "Delete project",
      destructive: true,
      onPress: () => setLastEvent("delete"),
    },
  ]

  const handleConfirm = () => {
    setConfirmLoading(true)
    setLastEvent("confirmed")
    // The dialog stays open and shows its spinner until the caller closes it —
    // that is the seam for a real network call.
    setTimeout(() => {
      setConfirmLoading(false)
      setConfirmOpen(false)
    }, 1200)
  }

  return (
    <View>
      <Specimen
        title="Inline alerts"
        description="No focus stealing, so these can sit several to a screen. Only the destructive variant announces itself as an alert — a success banner is the expected result of the user's own action and does not need to interrupt a screen reader."
        modulePath="composite/alert"
      >
        <Stack gap={SPACE.row}>
          {STATUS_TONES.map((variant) => (
            <MobileAlert key={variant} variant={variant} title={variant}>
              <MobileText variant="callout">
                A short body explaining what happened and what to do next.
              </MobileText>
            </MobileAlert>
          ))}
          <MobileAlert
            variant="warning"
            title="Action required"
            action={
              <MobileButton
                size="sm"
                variant="outline"
                onPress={() => setLastEvent("alert action")}
              >
                Fix now
              </MobileButton>
            }
          >
            <MobileText variant="callout">
              The action slot accepts any node.
            </MobileText>
          </MobileAlert>
          {dismissedAlert ? (
            <MobileText variant="caption" color="muted">
              Dismissible alert dismissed.
            </MobileText>
          ) : (
            <MobileAlert
              variant="info"
              title="Dismissible"
              onDismiss={() => setDismissedAlert(true)}
            >
              <MobileText variant="callout">
                Tap the dismiss affordance to remove this.
              </MobileText>
            </MobileAlert>
          )}
        </Stack>
      </Specimen>

      <Specimen
        title="Toasts"
        description="One toast owns the screen at a time — replacing rather than stacking, because a queue that outlives its relevance is worse than a replaced message. An action should use duration 0 so it cannot expire before the user reaches it."
        modulePath="composite/toast · useMobileToast()"
      >
        <Row gap={SPACE.label}>
          {STATUS_TONES.map((variant) => (
            <MobileButton
              key={variant}
              size="sm"
              variant="outline"
              onPress={() =>
                toast.show({
                  message: `${variant} toast — replaced, not stacked`,
                  variant,
                })
              }
            >
              {variant}
            </MobileButton>
          ))}
        </Row>
        <Spacer size={SPACE.row} />
        <Row gap={SPACE.label}>
          <MobileButton
            size="sm"
            variant="secondary"
            onPress={() =>
              toast.show({
                message: "Invite sent",
                variant: "success",
                duration: 0,
                action: {
                  label: "Undo",
                  onPress: () => setLastEvent("toast undo"),
                },
              })
            }
          >
            With action (duration 0)
          </MobileButton>
          <MobileButton size="sm" variant="ghost" onPress={toast.hide}>
            Hide
          </MobileButton>
        </Row>
      </Specimen>

      <Specimen
        title="Modal presentations"
        description="All three block the screen, so all three are for a decision the user must make before continuing. The bottom sheet takes snap points; the action sheet takes a list of choices; the confirm dialog takes one decision, and can hold a spinner while it commits."
        modulePath="primitive/bottom-sheet · composite/action-sheet · composite/confirm-dialog"
      >
        <Stack gap={SPACE.row}>
          <MobileButton variant="default" onPress={() => setSheetOpen(true)}>
            Open native bottom sheet
          </MobileButton>
          <MobileButton
            variant="secondary"
            onPress={() => setActionSheetOpen(true)}
          >
            Open action sheet
          </MobileButton>
          <MobileButton
            variant="destructive"
            onPress={() => setConfirmOpen(true)}
          >
            Open destructive confirm dialog
          </MobileButton>
        </Stack>
        <Readout label="Last event" value={lastEvent} />
        <Readout label="Scheme in context" value={ctx.scheme} />
      </Specimen>

      <Specimen
        title="Modal dialog"
        description="The in-app modal: backdrop fades while the panel springs up from 0.94 scale, one shared animated value driving both so the motion cannot desync. Backdrop press and the platform back gesture both close it."
        modulePath="primitive/modal"
      >
        <MobileButton variant="default" onPress={() => setModalOpen(true)}>
          Open modal
        </MobileButton>
      </Specimen>

      <Specimen
        title="Accordion"
        description="One section open at a time — opening a row closes its sibling, and tapping the open header collapses it. The right shape when the sections compete for the same decision, like shipping options."
        modulePath="primitive/accordion"
      >
        <MobileAccordion items={SHIPPING_ITEMS} defaultOpenId="standard" />
      </Specimen>

      <Specimen
        title="Collapsible"
        description="The bare animated show/hide the accordion and FAQ item are built on. Content stays mounted while closed, so form values and scroll position survive a collapse/expand round-trip."
        modulePath="primitive/collapsible"
      >
        <MobileButton
          size="sm"
          variant="secondary"
          onPress={() => setDetailsOpen((open) => !open)}
        >
          {detailsOpen ? "Hide details" : "Show details"}
        </MobileButton>
        <Spacer size={SPACE.label} />
        <MobileCollapsible open={detailsOpen}>
          <MobileText variant="callout" color="muted">
            The clip height springs between 0 and the measured content height
            while the text fades in and rises a few points — all three off one
            animated value.
          </MobileText>
        </MobileCollapsible>
      </Specimen>

      <Specimen
        title="FAQ items"
        description="Single-question disclosures with a chevron that rotates 90° as they open. Each item owns its own open state, so unlike the accordion several answers can stay open at once."
        modulePath="composite/faq-item"
      >
        <Stack gap={SPACE.row}>
          {FAQS.map((faq) => (
            <MobileFaqItem
              key={faq.question}
              question={faq.question}
              answer={<MobileText variant="callout">{faq.answer}</MobileText>}
            />
          ))}
        </Stack>
      </Specimen>

      <Specimen
        title="Tooltips"
        description="Long-press the button to reveal a small inverted bubble above it; it auto-hides after about a second and a half, or immediately on release. A tooltip is a glance, not a popover."
        modulePath="primitive/tooltip"
      >
        <MobileTooltip label="Sends a copy to your inbox">
          <MobileButton
            size="sm"
            variant="outline"
            onPress={() => setLastEvent("tooltip target pressed")}
          >
            Email me a copy — long-press
          </MobileButton>
        </MobileTooltip>
      </Specimen>

      <Specimen
        title="Offline banner"
        description="Warning-toned connectivity banner with a spring-driven show/hide, so a flapping connection slides rather than blinks. It stays mounted through the exit animation and unmounts only once the spring finishes."
        modulePath="composite/offline-banner"
      >
        <MobileButton
          size="sm"
          variant="outline"
          onPress={() => setBannerVisible((visible) => !visible)}
        >
          {bannerVisible ? "Hide banner" : "Show banner"}
        </MobileButton>
        <Spacer size={SPACE.label} />
        <MobileOfflineBanner
          visible={bannerVisible}
          message="No internet connection — showing cached data"
        />
      </Specimen>

      <Specimen
        title="Error boundary"
        description="Class-based, because getDerivedStateFromError is the only React API that catches render errors. The custom fallback gets the error and a reset callback; reset is optimistic — if the bug is deterministic the boundary simply re-catches."
        modulePath="composite/error-boundary"
      >
        <MobileErrorBoundary
          fallback={(error, reset) => (
            <Stack gap={SPACE.row}>
              <MobileText variant="callout" color="destructive">
                Caught: {error.message}
              </MobileText>
              <MobileButton
                size="sm"
                variant="outline"
                onPress={() => {
                  setExploded(false)
                  reset()
                  setLastEvent("boundary · reset")
                }}
              >
                Reset
              </MobileButton>
            </Stack>
          )}
        >
          <GuardedWidget exploded={exploded} />
        </MobileErrorBoundary>
        <Spacer size={SPACE.row} />
        <MobileButton
          size="sm"
          variant="destructive"
          onPress={() => setExploded(true)}
        >
          Break me
        </MobileButton>
      </Specimen>

      <MobileModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Invite a teammate"
        footer={
          <Row wrap={false} gap={10}>
            <MobileButton
              variant="outline"
              containerStyle={{ flex: 1 }}
              onPress={() => setModalOpen(false)}
            >
              Cancel
            </MobileButton>
            <MobileButton
              variant="default"
              containerStyle={{ flex: 1 }}
              onPress={() => {
                setModalOpen(false)
                setLastEvent("modal · invite sent")
              }}
            >
              Send invite
            </MobileButton>
          </Row>
        }
      >
        <MobileText variant="body" color="muted">
          They will get an email with a link that expires in 48 hours. You can
          revoke the invite any time before it is accepted.
        </MobileText>
      </MobileModal>

      <MobileBottomSheet
        isPresented={sheetOpen}
        onDismiss={() => setSheetOpen(false)}
        snapPoints={["half", "full"]}
      >
        <MobileText variant="title">Native slide-up sheet</MobileText>
        <MobileText variant="body" color="muted" style={{ marginTop: 8 }}>
          Rendered with the platform presentation — SwiftUI on iOS, Jetpack
          Compose on Android. Drag it up to the full snap point.
        </MobileText>
        <Spacer size={SPACE.block} />
        <MobileTextInput
          placeholder="A sheet is a good place for a short form"
          value={projectName}
          onChangeText={setProjectName}
          clearable
        />
        <Spacer size={SPACE.block} />
        <MobileButton variant="secondary" onPress={() => setSheetOpen(false)}>
          Dismiss sheet
        </MobileButton>
      </MobileBottomSheet>

      <MobileActionSheet
        isPresented={actionSheetOpen}
        onDismiss={() => setActionSheetOpen(false)}
        title="Project actions"
        message="Choose what to do with “atlas”."
        actions={PROJECT_ACTIONS}
        cancelLabel="Cancel"
      />

      <MobileConfirmDialog
        isPresented={confirmOpen}
        onDismiss={() => setConfirmOpen(false)}
        title="Delete this project?"
        message="This removes every deployment and cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep it"
        destructive
        loading={confirmLoading}
        onConfirm={handleConfirm}
      />
    </View>
  )
}
