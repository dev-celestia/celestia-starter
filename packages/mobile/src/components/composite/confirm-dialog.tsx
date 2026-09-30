import * as React from "react"
import {
  Animated,
  View,
  StyleSheet,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { SPRING_ENTRANCE, springTo } from "../../motion"
import { MobileBottomSheet } from "../primitive/bottom-sheet"
import { MobileButton } from "../primitive/button"
import { MobileText } from "../primitive/text"

export interface MobileConfirmDialogProps {
  /**
   * Whether the dialog is visible.
   */
  isPresented: boolean
  /**
   * Called when the dialog is dismissed without confirming.
   */
  onDismiss: () => void
  /**
   * Question being asked.
   */
  title: string
  /**
   * Optional consequences, spelled out beneath the title.
   */
  message?: string
  /**
   * @default 'Confirm'
   */
  confirmLabel?: string
  /**
   * @default 'Cancel'
   */
  cancelLabel?: string
  /**
   * Renders the confirm button in the destructive variant. Use this for
   * anything that deletes or cannot be undone.
   * @default false
   */
  destructive?: boolean
  /**
   * Puts the confirm button in a pending state. The dialog stays open — the
   * caller decides when to dismiss it, so a failed request does not silently
   * look like a success.
   * @default false
   */
  loading?: boolean
  /**
   * Called when the confirm button is pressed.
   */
  onConfirm?: () => void
  /**
   * Optional style override for the dialog body.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileConfirmDialog
 *
 * Confirmation prompt built on the native bottom sheet — a modal question with
 * exactly two exits.
 *
 * Two deliberate constraints:
 *
 * 1. **Dismissal is never coupled to confirmation.** `onConfirm` fires and the
 *    dialog stays open until the caller dismisses it, so an async failure cannot
 *    be mistaken for success.
 * 2. **Cancel is the visually lighter control and comes first**, so the
 *    destructive option is not the one sitting under the thumb.
 */
export function MobileConfirmDialog({
  isPresented,
  onDismiss,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  style,
  testID,
}: MobileConfirmDialogProps) {
  const { colors } = useMobileTheme()

  // The sheet's slide-up and backdrop belong to the native SwiftUI/Compose
  // presentation (MobileBottomSheet), so the motion this layer owns is the
  // dialog body: opacity + scale 0.9 → 1 with a slight overshoot, replayed
  // each time the dialog is presented.
  const entrance = React.useRef(new Animated.Value(0)).current
  React.useEffect(() => {
    if (!isPresented) {
      entrance.setValue(0)
      return
    }
    springTo(entrance, 1, SPRING_ENTRANCE).start()
  }, [isPresented, entrance])
  const scale = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  })
  const fade = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolateRight: "clamp",
  })

  return (
    <MobileBottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      snapPoints={["half"]}
      testID={testID}
      style={style}
    >
      <Animated.View
        style={[styles.body, { opacity: fade, transform: [{ scale }] }]}
      >
        <MobileText variant="title" align="center">
          {title}
        </MobileText>

        {message ? (
          <MobileText
            variant="callout"
            color="muted"
            align="center"
            style={styles.message}
          >
            {message}
          </MobileText>
        ) : null}

        <View style={styles.actions}>
          <MobileButton
            variant="outline"
            onPress={onDismiss}
            disabled={loading}
          >
            {cancelLabel}
          </MobileButton>

          <MobileButton
            variant={destructive ? "destructive" : "default"}
            onPress={() => onConfirm?.()}
            disabled={loading}
          >
            {loading ? `${confirmLabel}…` : confirmLabel}
          </MobileButton>
        </View>

        {destructive ? (
          <MobileText
            variant="caption"
            align="center"
            style={[styles.warning, { color: colors.destructive }]}
          >
            This action cannot be undone.
          </MobileText>
        ) : null}
      </Animated.View>
    </MobileBottomSheet>
  )
}

const styles = StyleSheet.create({
  body: {
    paddingTop: 8,
  },
  message: {
    marginTop: 8,
  },
  actions: {
    marginTop: 24,
    gap: 10,
  },
  warning: {
    marginTop: 12,
  },
})
