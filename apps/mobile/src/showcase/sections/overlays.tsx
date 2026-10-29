import * as React from "react"
import { View } from "react-native"
import {
  MobileActionSheet,
  MobileAlert,
  MobileBottomSheet,
  MobileButton,
  MobileConfirmDialog,
  MobileText,
  MobileTextInput,
  useMobileToast,
  type MobileActionSheetAction,
  type MobileAlertVariant,
  type MobileToastVariant,
} from "@celestia-project/mobile"
import type { ShowcaseContext } from "../types"
import { Readout, Row, Spacer, Specimen, Stack } from "../ui"

/**
 * Overlays — the five modules that interrupt.
 *
 * `alert`, `toast`, `bottom-sheet`, `action-sheet`, `confirm-dialog`.
 *
 * There are three genuinely different interruption levels here and they are not
 * interchangeable:
 *
 * - **Alert** is *inline*. It sits in the flow of the page and does not steal
 *   focus, so it is right for a validation summary or a plan warning.
 * - **Toast** is *transient*. It reports an outcome the user just caused, and
 *   auto-dismisses.
 * - **Sheet / action sheet / confirm dialog** are *modal*. They block, so they
 *   are only for a decision the user must make before continuing.
 *
 * Reaching for a modal when an inline alert would do is the most common way a
 * mobile app ends up feeling hostile.
 */

const ALERT_VARIANTS: MobileAlertVariant[] = [
  "info",
  "success",
  "warning",
  "destructive",
]

const TOAST_VARIANTS: MobileToastVariant[] = [
  "info",
  "success",
  "warning",
  "destructive",
]

export function OverlaysSection({ ctx }: { ctx: ShowcaseContext }) {
  const toast = useMobileToast()
  const [dismissedAlert, setDismissedAlert] = React.useState(false)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [actionSheetOpen, setActionSheetOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [confirmLoading, setConfirmLoading] = React.useState(false)
  const [lastEvent, setLastEvent] = React.useState("—")
  const [projectName, setProjectName] = React.useState("atlas")

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
        <Stack gap={12}>
          {ALERT_VARIANTS.map((variant) => (
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
        <Row gap={8}>
          {TOAST_VARIANTS.map((variant) => (
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
        <Spacer size={10} />
        <Row gap={8}>
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
        <Stack gap={10}>
          <MobileButton
            variant="default"
            onPress={() => setSheetOpen(true)}
          >
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
        <Spacer size={16} />
        <MobileTextInput
          placeholder="A sheet is a good place for a short form"
          value={projectName}
          onChangeText={setProjectName}
          clearable
        />
        <Spacer size={20} />
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
